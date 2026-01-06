class ValidationError extends Error {
  constructor(message){
    super(message)
    this.name = 'ValidationError'
  }
}

class BadRequestError extends ValidationError {
  constructor(message){
    super(message)
    this.name = 'BadRequestError'
  }
}

class BadResponseError extends ValidationError {
  constructor(message){
    super(message)
    this.name = 'BadResponseError'
  }
}

class ApiError extends Error {
  constructor(message){
    super(message)
    this.name = 'ApiError'
    this.code = 'APIERR'
  }
}

module.exports = { ValidationError, BadRequestError, BadResponseError, ApiError }