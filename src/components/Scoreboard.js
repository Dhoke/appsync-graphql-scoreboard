import React, { useContext, useEffect, useState } from 'react'
import classes from './Scoreboard.module.css'
import { ScoreboardContext } from '../context/ScoreboardContext'

const Scoreboard = () => {

    const context = useContext(ScoreboardContext)
    useEffect(() => {
        console.log("This effect is running!")
        context.getAllChallengers()
    }, [])

    const [choice, setChoice] = useState('Mario')
    const [name, setName] = useState('')

    const submitName = () => {
        if ((name !== '') && (typeof name !== 'undefined')) {
            context.createChallenger(name)
        }

    }

    return (
        <div>
            <div className={classes.container}>
                <div className={classes.header}>
                    <div>Live scores</div>
                </div>
                <div className={classes.scoreboard}>
                    <div className='flexGrid'>
                        <div className={`${classes.row}`}>
                            <div className={`${classes.column} ${classes.heading}`}>Name</div>
                            <div className={`${classes.column} ${classes.heading}`}>Score</div>
                        </div>
                        {context.challengers.map(challenger => {
                            return (
                                <div onClick={() => setChoice(challenger.Name)} className={`${classes.row}`}>
                                    <div className={`${classes.column} ${classes.name}`}>{challenger.Name}</div>
                                    <div className={`${classes.column}`}>{challenger.Score}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={classes.controls}>
                    <div className={classes.formGroup}>
                        <input type='text' placeholder='New challenger' value={name} onChange={(e) => setName(e.target.value)}></input>
                        <input className={classes.btn} onClick={submitName} type='button' value='A challenger approaches!'></input>
                    </div>
                    <input className={classes.btn} onClick={() => context.incrementScore(choice)} type='button' value={`Award ${choice} 10pts`}></input>
                </div>
            </div>
        </div>
    )
}

export default Scoreboard