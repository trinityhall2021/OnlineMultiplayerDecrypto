import WordCard from "./WordCard";


function WordCardList(props) {
    // TODO: Check whether there are 4 words in the word card list 
    const word_card_list = [];
    for (let i=0; i<props.word_list.length; i++) {
        word_card_list.push(<div className="flex-container column"> <WordCard word={i.toString()} /> <WordCard word={props.word_list[i]} /> </div>)
    }
    return (
        <div className="flex-container">
            {word_card_list}
        </div>
    )
}

export default WordCardList;