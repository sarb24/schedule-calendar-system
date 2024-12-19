describe('Booking Flow', () => {
  it('allows a user to book an available shift', () => {
    cy.login('serviceuser@example.com', 'password')
    cy.visit('/dashboard')
    cy.get('[data-testid="available-shift"]').first().click()
    cy.get('[data-testid="book-button"]').click()
    cy.get('[data-testid="booking-confirmation"]').should('be.visible')
  })
})

