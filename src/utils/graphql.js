import Axios from 'axios'
import { HttpError } from './http'

/**
 * Make a GraphQL Query to the specified
 *
 * @param {object} obj GraphQL Query
 * @returns {Promise<Object>} Data from GraphQL according to the query
 */
function _makeQuery (query, token) {
  const graphQLEndpoint = process.env.GRAPHQL_ENDPOINT
  return Axios.post(graphQLEndpoint, { query }, {
    headers: { 'Authorization': `JWT ${token}` }
  })
    .then(({ data }) => {
      const result = data.data
      if (data.errors) {
        throw new HttpError('Error GRAPHQL', data.errors)
      }
      return result[Object.keys(result)[0]]
    })
}

/**
 * Get student info by his email
 *
 * @param {string} email Email associated to the user
 * @returns {Promise<StudentUser>}
 */
export function getStudentInfo (email) {
  const query = `{
    studentByEmail (email: "${email}") {
      id
      firstName
      lastName
      studentNumber
      specialization {
        id
        label
        openingChoiceDateS1
        closingChoiceDateS1
        openingChoiceDateS2
        closingChoiceDateS2
      }
      credentials {
        email
        password
        isVerified
      }
    }
  }`
  return _makeQuery(query)
}

/**
 * Get one user credential
 *
 * @param {'professor' | 'student' | 'admin'} type User type
 * @param {string} email Email associated to the user
 *
 * @returns {Promise<StudentUser>}
 */
export function getAccountCredentials (type, email) {
  const query = `
    ${type}Credentials(email: ${email}) {
      id,
      credentials {
        email,
        password,
        isVerified
      }
    }
  `

  return _makeQuery(query)
}

/**
 * Create a new student
 *
 * @param {Object} object.email
 * @param {Object} object.password
 * @param {Object} object.specializationId
 * @param {Object} object.firstName
 * @param {Object} object.lastName
 * @param {Object} object.studentNumber
 *
 * @returns {Promise<StudentUser>}
 */
export function createStudent ({ email,
  password,
  specializationId,
  firstName,
  lastName,
  studentNumber
}) {
  const mutation = `
    mutation {
      createStudent(
        email: "${email}",
        password: "${password}",
        firstName: "${firstName}",
        lastName: "${lastName}",
        studentNumber: "${studentNumber}",
        specializationId:" ${specializationId}"
      ) {
        id
        firstName
        lastName
        studentNumber
        specialization {
          id
          label
          openingChoiceDateS1
          closingChoiceDateS1
          openingChoiceDateS2
          closingChoiceDateS2
        }
        credentials {
          email
          isVerified
        }
      }
    }
  `

  return _makeQuery(mutation)
}

export function getProfessorInfo (email) {
  const query = `{
    professorByEmail (email: "${email}") {
      id
      firstName
      lastName
      credentials {
        email
        password
        isVerified
      }
    }
  }`
  return _makeQuery(query)
}

export function createProfessor ({
  email,
  password,
  firstName,
  lastName
}) {
  const mutation = `
    mutation {
      createProfessor(
        email: "${email}",
        password: "${password}",
        firstName: "${firstName}",
        lastName: "${lastName}",
      ) {
        id
        firstName
        lastName
        credentials {
          email
          isVerified
        }
      }
    }
  `

  return _makeQuery(mutation)
}

export function getAdminInfo (email) {
  const query = `{
    adminByEmail (email: "${email}") {
      id
      credentials {
        email
        password
        isVerified
      }
    }
  }`
  return _makeQuery(query)
}

export function createAdmin ({
  email,
  password
}) {
  const mutation = `
    mutation {
      createAdmin(
        email: "${email}",
        password: "${password}"
      ) {
        id
        credentials {
          email
          isVerified
        }
      }
    }
  `

  return _makeQuery(mutation)
}

export function validateUser ({ userType, userId }) {
  let mutationName

  switch (userType) {
    case 'STUDENT':
      mutationName = 'validateStudent'
      break
    case 'PROFESSOR':
      mutationName = 'validateProfessor'
      break
  }

  const mutation = `
    mutation {
      ${mutationName} (id: ${userId}) {
        credentials { email isVerified }
      }
    }
  `

  return _makeQuery(mutation)
}

export function adminSetPassword ({ credentialsId, password, token }) {
  const mutation = `
    mutation {
      adminSetPassword(
        credentialsId: "${credentialsId}"
        password: "${password}"
      ) { id }
    } 
  `

  return _makeQuery(mutation, token)
}

/**
 * @typedef StudentUser
 * @type {object}
 * @property {int} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} studentNumber
 * @property {object} specialization
 * @property {int} specialization.id
 * @property {string} specialization.label
 * @property {string} specialization.openingChoiceDateS1
 * @property {string} specialization.closingChoiceDateS1
 * @property {string} specialization.openingChoiceDateS2
 * @property {string} specialization.closingChoiceDateS2
 * @property {object} credentials
 * @property {string} credentials.email
 * @property {string?} credentials.password
 */

/**
 * @typedef Credentials
 * @type {object}
 * @property {string} email User's email
 * @property {string} password User's password hashed
 * @property {boolean} isVerified Tells if the account is ON
 */

/**
 * @typedef UserCredentials
 * @type {object}
 * @property {string} id User's ID
 * @property {Credentials} credentials User credentials
 */
