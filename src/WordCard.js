import React, { Component } from 'react';
import './WordCard.css'
class WordCard extends Component {

    constructor(props){
        super(props);
        this.state = {
            word: props.word
        }
    }

    render() {
        // TODO: Fix the shapes 
        return (
            <div className="wordcard">
                {this.state.word}
            </div>
        )
    }
}

export default WordCard;