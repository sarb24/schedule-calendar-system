describe('Booking Flow', () => {
  beforeEach(() => {
    cy.login('serviceuser@example.com', 'password')
  })

  it('allows a user to book an available shift', () => {
    cy.visit('/dashboard')
    cy.get('[data-testid="available-shift"]').first().click()
    cy.get('[data-testid="book-button"]').click()
    cy.get('[data-testid="booking-confirmation"]').should('be.visible')
  })

  it('prevents booking an unavailable shift', () => {
    cy.visit('/dashboard')
    cy.get('[data-testid="booked-shift"]').first().click()
    cy.get('[data-testid="book-button"]').should('be.disabled')
  })

  it('allows admin to create a new shift', () => {
    cy.login('admin@example.com', 'adminpassword')
    cy.visit('/dashboard')
    cy.get('[data-testid="add-shift-button"]').click()
    cy.get('[data-testid="shift-form"]').within(() => {
      cy.get('[name="date"]').type('2023-12-01')
      cy.get('[name="startTime"]').type('09:00')
      cy.get('[name="endTime"]').type('17:00')
      cy.get('[name="type"]').select('MORNING')
      cy.get('[type="submit"]').click()
    })
    cy.get('[data-testid="shift-created-message"]').should('be.visible')
  })
})

