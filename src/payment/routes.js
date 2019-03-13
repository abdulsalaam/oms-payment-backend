const express = require('express')
const PaymentService = require('./PaymentService')

const router = express.Router()

router.get('/payment', function(req, res, next) {
  const { db } = req

  const paymentsService = new PaymentService(db)

  paymentsService
    .listPayment()
    .then(payment => res.status(200).json({ payment }))
    .catch(next)
})

router.post('/payment', function(req, res, next) {
  const { db, body } = req;
  console.log('requesttt:',req.headers.pin);
  let pin = req.headers.pin;
  const paymentsService = new PaymentService(db)

  paymentsService
    .createPayment(body, pin)
    .then(payment => res.status(200).json({ payment }))
    .catch(next)
})

router.patch('/payment/:id', function(req, res, next) {
  const { db, body } = req

  const { id } = req.params

  const paymentsService = new PaymentService(db)

  paymentsService
    .patchPayment(id, body)
    .then(payment => res.status(200).json({ payment }))
    .catch(next)
})

module.exports = router
