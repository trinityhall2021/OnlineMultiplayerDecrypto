import React, { Fragment } from "react";
import "tabler-react/dist/Tabler.css";
import { Grid, Badge, Card, Table } from "tabler-react";

const PlayerRow = (props) => {
return (
    <Table.Row>
        <Table.Col>
            {props.player}
            {(props.player == props.username) ? <Badge className="mx-2">YOU</Badge>:<Fragment/>}
        </Table.Col>
        <Table.Col/>
    </Table.Row>
);
};

const Team = (props) => {
    let teamColor = (props.teamData.color === 'red') ? "danger" : "primary";
    let teamName = (props.teamData.color === 'red') ? "Team Red" : "Team Blue";
    let teamMembers = props.teamData.players.map((p) => <PlayerRow player={p} username={props.username}/>);

    return (
        <Grid.Col>
        <Card
            statusColor={teamColor}
            title={teamName}
        >
            <Table
            cards={true}
            striped={true}
            responsive={true}
            >
            <Table.Header>
                <Table.Row>
                <Table.ColHeader>Misses: {props.teamData.misses}</Table.ColHeader>
                <Table.ColHeader>Intercepts: {props.teamData.intercepts}</Table.ColHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {teamMembers}
            </Table.Body>
            </Table>
        </Card>
        </Grid.Col>
    );
};

export default Team;