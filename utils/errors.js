class ValidationError extends Error {
  constructor(message){
    super(message)
    this.name = 'ValidationError'
  }
}

class ApiError extends Error {
  constructor(message){
    super(message)
    this.name = 'ApiError'
  }
}

module.exports = { ValidationError, ApiError }