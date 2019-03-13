const { ObjectId } = require('mongodb')
const ValidationError = require('../errors/ValidationError')
const ResourceNotFoundError = require('../errors/ResourceNotFoundError')

module.exports = class PaymentsService {
  constructor(db) {
    this.db = db
  }

  async listPayments() {
    const payments = await this.db
      .collection('payments')
      .find({})
      .sort({ _id: 1 })
      .toArray()

    return payments
  }

  async createPayment(paymentData, pin) {
    //let dPayment = {};
    console.log('requestttt:', paymentData);
    if (pin !== '123456789') {
       return ({'status':false, 'message':'not authorised user'});
    }
	
     let paymentStatusArray = [
    'confirmed',
    'declined'
    ];
    let  randomIndex = Math.floor(Math.random() * paymentStatusArray.length);
    const randomStatus = paymentStatusArray[randomIndex];

    const result = await this.db.collection('payments').insert({
      userId: paymentData.userId,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      status: randomStatus,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const payment = result.ops[0]

    return payment
  }

  async patchPayment(paymentId, paymentData) {
    if (!ObjectId.isValid(paymentId)) {
      throw new ResourceNotFoundError('Payment')
    }

    paymentId = new ObjectId(paymentId)

    paymentData = sanitize(paymentData)

    validate(paymentData)

    paymentData.updatedAt = new Date()

    const result = await this.db
      .collection('payments')
      .findOneAndUpdate(
        { _id: paymentId },
        { $set: paymentData },
        { returnOriginal: false }
      )

    if (!result.value) {
      throw new ResourceNotFoundError('Payment')
    }

    return result.value

    function sanitize(paymentData) {
      const sanitizedPaymentData = {}

      if (paymentData.title != null) {
        sanitizedPaymentData.title = paymentData.title
      }

      if (typeof paymentData.title === 'string') {
        sanitizedPaymentData.title = paymentData.title.trim()
      }

      if (paymentData.completed != null) {
        sanitizedPaymentData.completed = paymentData.completed
      }

      return sanitizedPaymentData
    }

    function validate(paymentData) {
      const invalidFields = {}

      if (paymentData.title != null && typeof paymentData.title !== 'string') {
        invalidFields.title = 'must be a string'
      } else if (paymentData.title === '') {
        invalidFields.title = 'cannot be an empty string'
      }

      if (
        paymentData.completed != null &&
        typeof paymentData.completed !== 'boolean'
      ) {
        invalidFields.completed = 'must be a boolean'
      }

      if (Object.keys(invalidFields).length > 0) {
        throw new ValidationError(invalidFields)
      }
    }
    
  }
}
