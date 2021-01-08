function Team(props) {
  const team_players = [];

  for (let i = 0; i < props.team_players.length; i++) {
    team_players.push(<p>{props.team_players[i]}</p>);
  }
  return (
    <div>
      <p> {props.team_name} Team </p>
      {team_players}
      <p># misses: {props.num_misses}</p>
      <p># intercepts: {props.num_intercepts}</p>
    </div>
  );
}

export default Team;
