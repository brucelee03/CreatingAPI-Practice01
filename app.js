const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDbServer()
// API 1

app.get('/players/', async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }
  const playersData = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id
    `
  const playersArray = await db.all(playersData)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//API 2
app.post('/players/', async (request, response) => {
  const playersDetails = request.body
  const {playerName, jerseyNumber, role} = playersDetails
  const addPlayers = `
  INSERT INTO
  cricket_team(player_name, jersey_number, role)
  VALUES ('${playerName}', '${jerseyNumber}', '${role}'); `
  const dbResponse = await db.run(addPlayers)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

//API 3
app.get(`/players/:playerId/`, async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }
  const {playerId} = request.params
  const playerData = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId}
    `
  const playerDetails = await db.get(playerData)
  response.send(convertDbObjectToResponseObject(playerDetails))
})

//API 4
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerDetails = `
  UPDATE cricket_team
  SET 
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
  WHERE player_id = ${playerId};
  `
  await db.run(updatePlayerDetails)
  response.send('Player Details Updated')
})

//API 5
app.delete(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const deletePlayerData = `
    DELETE FROM 
      cricket_team
    WHERE player_id = ${playerId};
    `
  await db.run(deletePlayerData)
  response.send('Player Removed')
})

module.exports = app
