const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const { findOne } = require('../models/user')
const User = require('../models/user')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task  = new Task({
            ...req.body,
            owner: req.user._id
    })
    try {
            await task.save()
            res.status(201).send(task)
    } catch (e) {
            res.status(400).send(e)
    }
})

//GET /tasks?completed=false
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req, res) => { 
    const match = {}
    const sort ={}
    if (req.query.completed) {
            match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
            const parts = req.query.sortBy.split('_')
            console.log(parts[1])
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    console.log(sort)

    try {
        //     const tasks = await Task.find({owner:req.user._id})
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
    } catch (e) {
            res.status(500).send(e)
    }
})
   

router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id
    try {
            const task = await Task.findOne({_id, owner:req.user._id})

            if (!task) {
                    return res.status(404).send()
            }
            res.send(task)
    } catch (e) {
            res.status(500).send(e)
    }

})

router.patch('/tasks/:id', auth, async(req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation =  updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
            return res.status(400).send({error:'Invalid updates!'})
    }

    try {
            const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
            updates.forEach((update) => task[update]=req.body[update])
            await task.save()
            //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
            if (!task) {
                    res.status(404).send()
            }
            res.send(task)
    } catch(e) {
            res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
    try {
            const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id}) 
            console.log(task)
            if(!task) {
                    res.status(404).send()
            }
            res.send(task)
    } catch (e) {
           res.status(500).send() 
    }
})

module.exports = router