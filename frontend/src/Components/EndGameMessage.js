import { Alert } from "tabler-react";

const EndGameMessage = (props) => {
    if (props.red_team_endgame === "win" && props.blue_team_endgame === "loss") {
        return (
            <Alert type="danger">
                <strong>Red team</strong> wins!
            </Alert>
            );
    } else if (props.red_team_endgame === "loss" && props.blue_team_endgame === "win") {
        return (
            <Alert type="primary">
                <strong>Blue team</strong> wins!
            </Alert>
            );
    } else if (props.red_team_endgame === "tie" && props.blue_team_endgame === "tie") {
        return (
            <Alert type="success">
                It is a <strong>tie</strong> !
            </Alert>
        )
    } else {
        return <Alert />
    }
};

export default EndGameMessage;