# Achievement Hub Database

Achievement Hub uses MongoDB.

## Collections

### users

Stores registered users.

Fields may include:

- name
- email
- password
- steamId
- steamName
- steamAvatar
- achievementXP
- createdAt
- updatedAt

### games

Stores games connected to each user.

Fields may include:

- userId
- steamAppId
- name
- image
- playtime
- totalAchievements
- unlockedAchievements
- completionPercentage
- updatedAt

### achievements

Stores Steam achievement data.

Fields may include:

- userId
- steamAppId
- achievementId
- name
- description
- unlocked
- unlockTime
- rarity
- icon

## Security

Never upload MongoDB passwords, connection strings, JWT secrets, or Steam API keys to GitHub.

Private values must stay inside:

api/.env
