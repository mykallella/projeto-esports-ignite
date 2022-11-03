import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from './utils/converte-hour-string-to-minutes'
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string'

const app = express()

app.use(express.json())
app.use(cors()) // Permite definir quais front-ends(domínios) são permitidos acessar a aplicação

const prisma = new PrismaClient ({ // Faz conexão com o DB    
}) 

// Listagem de games com contagem de anúncios
app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    })

    return response.json(games)
})

// Criação de novo anúncio
app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id
    const body: any = request.body
   
    const ad = await prisma.ad.create({
        data: {
            gameId: gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    })

    return response.status(201).json(ad)
})

// Listagem de anúncios por game
app.get('/games/:id/ads', async (request, response) => {  
    const gameId = request.params.id

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,            
            hourEnd: true,            
        },
        where: {
            gameId: gameId
        },
        orderBy: {
            createdAt: 'desc',
        }
    })

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd),
        }
    }))
})

// Buscar discord pelo ID do anúncio
app.get('/ads/:id/discord', async (request, response) => {  
    const adId = request.params.id

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })
    
    return response.json({
        discord: ad.discord,
    })
})


app.listen(3333)



// request => dados da requisição do usuário
// response => dados que vão para o navegador (dados da API)

