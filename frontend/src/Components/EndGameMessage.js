import { Alert, Grid, Button, Header, Table } from "tabler-react";

const EndGameMessage = (props) => {


    if (props.red_team_endgame === "not yet") {
        return <Alert />
    }

    const endgameColor = props.red_team_endgame === "win" ? (
        "danger"
    ) : props.red_team_endgame === "loss" ? (
        "primary"
    ) : (
        "warning"
    ) 

    const endGameMessage = props.red_team_endgame === "win" ? (
        "Red team wins!"
    ) : props.red_team_endgame === "loss" ? (
        "Blue team wins!"
    ) : props.red_team_endgame === "tie" ? (
        "It is a tie!"
    ) : (
        "Game hasn't ended yet"
    );

    return (
        <Grid.Row className="px-5 mx-5">
        <Grid.Col>
        <Alert type={endgameColor} align="center" isDismissible>
            <p><strong>{endGameMessage}</strong></p>
            <Button.List>
                <Button color="info" RootComponent="button" >Rematch</Button>
                <Button color="secondary" RootComponent="button">Reveal Words</Button>
            </Button.List>
        </Alert> 
        </Grid.Col>
        </Grid.Row>
        )
};

export default EndGameMessage;