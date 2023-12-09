const express = require('express')
const {open} = require('sqlite')
const sqlite3 = requie('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketTeam.db')

const app = express()

app.use(express.json)

let database = null

const intializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB ERROR: ${error.message}`)
    process.exit(1)
  }
}

intializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerNmae: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/player/', async (request, response) => {
  const getPlayersQuery = `
    SELECT 
      *
    FROM
      cricket_team;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.parmas
  const getPlayersQuery = `
    SELECT 
      *
    FROM 
      cricket_team
    WHERE
      player_id = ${playerId};`
  const player = await database.get(getPlayersQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `
    INSERT INTO 
       cricket_team (player_name, jersey_number, role)
    VALUES
       ('${playerName}','${jerseyNumber}','${role}');`
  const player = await database.run(postPlayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.parmas
  const updatedPlayerQuery = `
    UPDATE
       cricket_team
    SET
       player_name = '${playerName}',
       jersey_number = '${jerseyNumber}',
       role = '${role}')
    WHERE
       player_id = ${playerId}`

  await database.run(updatedPlayerQuery)
  response.send('Player Details updated')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.parmas
  const deletePlayerQuery = `
    DELETE FROM
       cricket_team
    WHERE
       player_id = ${playerId}`
  await database.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
