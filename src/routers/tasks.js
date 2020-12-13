const express = require('express');
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(error)
    }
})

// GET /tasks?limit&skip=0
// GET /tasks?completed=true/false
// GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {

    let match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOne({ _id, owner: req.user._id})
        if(!task){
            return res.status(400).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowToUpdate = ['description', 'completed']
    const isValidUpdate = updates.every((item) => allowToUpdate.includes(item))

    if(!isValidUpdate){
        return res.status(400).send()
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
       
        if(!task){
            return res.status(404).send()
        }
        updates.forEach(item => task[item] = req.body[item])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send()
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.send(500).send()
    }
})

router.delete('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.deleteMany({owner: req.user._id})
        if(!tasks){
            return res.status(404).send('There is no tasks to delete')
        }
        res.send(tasks)
    } catch (error) {
        res.send(500).send()
    }
})

module.exports = router