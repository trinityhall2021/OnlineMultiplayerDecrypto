import React, { Fragment } from "react";
import "tabler-react/dist/Tabler.css";
import { Grid, Badge, Card, Table } from "tabler-react";

const PlayerRow = (props) => {
    return (
        <Table.Row>
            <Table.Col>
                {props.player.name}
                {props.isYou ? <Badge className="mx-2">YOU</Badge>:<Fragment/>}
            </Table.Col>
            <Table.Col>
                <Badge color="secondary" className="mx-2">{props.player.state}</Badge>
            </Table.Col>
        </Table.Row>
    );
};

const Team = (props) => {

    const teamColor = (props.teamData.color === 'RED') ? "danger" : "primary";
    const teamName = (props.teamData.color === 'RED') ? "Team Red" : "Team Blue";
    const teamMembers = props.teamData.players.map((p, i) => <PlayerRow player={p} isYou={props.username === p.name} key={i}/>);

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

const Teams = (props) => {
    return (
        <Grid.Row cards alignItems="center" className="px-5 mx-5">
            {props.teamsData.map((t, i) => <Team teamData={t} username={props.username} key={i}/>)}
        </Grid.Row>
    );
};

export default Teams;