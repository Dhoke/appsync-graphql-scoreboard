import React, { Component } from 'react'
import gql from 'graphql-tag'
import AWSAppSyncClient from 'aws-appsync'
import awsExports from '../aws-exports'

export const ScoreboardContext = React.createContext()

class ScoreBoardContextProvider extends Component {

    state = {
        challengers: []
    }

    // AWS configuration
    apiKey = 'da2-4zcr3xolajdqxfprflmgg23hl4'
    url = awsExports.ENDPOINT
    region = awsExports.REGION
    auth_type = awsExports.AUTH_TYPE

    // Subscribe to new challengers
    newContenderSubscription = gql(`
        subscription newContender {
            onCreateScoreBoardModel {
                Name
                Score
            }
        }
    `)

    // Subscribe to score changes
    scoreUpdateSubscription = gql(`
        subscription scoreUpdate {
            onIncrementScore {
                Name
                Score
            }
        }
    `)

    // Get a list of all current challengers
    listChallengersQuery = gql(`
        query {
            listScoreBoardModels {
                items {
                    Name,
                    Score
                }
            }
        }
    `)

    // Call the increment score mutator
    incrementScoreMutator = gql(`
        mutation doIncrementScore($input: IncrementScoreInput!) {
            incrementScore(input: $input) {
                Name
                Score
            }
        }
    `)

    // Create a new challenger
    createChallengerMutation = gql(`
        mutation doCreateScoreBoardModel($input: CreateScoreBoardModelInput!) {
            createScoreBoardModel(input: $input) {
                Name
                Score
            }
        }
    `)


    client = new AWSAppSyncClient({
        url: this.url,
        region: this.region,
        auth: {
            type: this.auth_type,
            apiKey: this.apiKey,
        }
    });

    // Updates the current state to reflect changes
    // Not optimal, but will do for the prototype
    updateChallenger = (name, score) => {
        const currentChallengers = [...this.state.challengers]
        let updateMade = false
        for (let challenger of currentChallengers) {
            if (challenger.Name === name) {
                challenger.Score = score
                updateMade = true
            }
        }
        if (!updateMade) {
            currentChallengers.push({ Name: name, Score: score })
        }
        this.setState({ challengers: currentChallengers })
    }

    // Queries AppSync for all the required challengers
    getAllChallengers = () => {
        this.client.hydrated().then(client => {
            client.query({ query: this.listChallengersQuery, fetchPolicy: 'network-only' })
                .then(response => {
                    console.log('All challengers: ', response)
                    this.setState({ challengers: response.data.listScoreBoardModels.items })
                })
        })
    }

    // Updates the scores in appsync
    incrementScore = (name) => {
        console.log(`Updating score for ${name}`)
        this.client.hydrated().then(client => {
            client.mutate({
                mutation: this.incrementScoreMutator,
                variables: {
                    input: { Name: name }
                }
            })
                .then(response => {
                    console.log(`Incremented ${name}'s score. `, response)
                    this.updateChallenger(response.data.incrementScore.Name, response.data.incrementScore.Score)
                })
        })
    }

    createChallenger = (name, callback) => {
        this.client.hydrated().then(client => {
            client.mutate({
                mutation: this.createChallengerMutation,
                variables: {
                    input: {
                        Name: name,
                        Score: 0,
                    }
                }
            })
                .then(response => {
                    this.updateChallenger(response.data.createScoreBoardModel.Name, response.data.createScoreBoardModel.Score)
                })
        })
    }

    constructor() {
        super()
        this.client.hydrated().then(client => {
            const observable = client.subscribe({ query: this.newContenderSubscription })
            const scoreUpdates = client.subscribe({ query: this.scoreUpdateSubscription })

            const realTimeResults = (response) => {
                console.log('Realtime data: ', response)
                console.log('Updating...')
                this.updateChallenger(response.data.onCreateScoreBoardModel.Name, response.data.onCreateScoreBoardModel.Score)
            }
            const scoreUpdate = (response) => {
                console.log('Realtime data: ', response)
                console.log('Updating...')
                this.updateChallenger(response.data.onIncrementScore.Name, response.data.onIncrementScore.Score)
            }

            observable.subscribe({
                next: realTimeResults,
                complete: console.log,
                error: console.error,
            })
            scoreUpdates.subscribe({
                next: scoreUpdate,
                complete: console.log,
                error: console.error
            })
        })
    }

    render() {
        return (
            <ScoreboardContext.Provider value={{
                challengers: this.state.challengers,
                getAllChallengers: this.getAllChallengers,
                incrementScore: this.incrementScore,
                createChallenger: this.createChallenger,
            }}>
                {this.props.children}
            </ScoreboardContext.Provider>
        )
    }
}

export default ScoreBoardContextProvider