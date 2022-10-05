import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  ListGroup,
  Image,
  Row,
  Col,
  Button,
  Card,
  Container,
} from 'react-bootstrap'
import { addToCart, removeFromCart } from '../actions/cartActions'
import Message from '../components/Message'
import StripeCheckout from 'react-stripe-checkout'

const KEY = loadStripe(process.env.STRIPE_SECRET_KEY)

const ReservationScreen = ({ match, location }) => {
  const eventId = match.params.id

  const plc = location.search ? Number(location.search.split('=')[1]) : 1

  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)
  const { cartItems } = cart

  cart.itemsPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.plc,
    0
  )

  useEffect(() => {
    if (eventId) {
      dispatch(addToCart(eventId, plc))
    }
  }, [dispatch, eventId, plc])

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id))
  }

  const history = useHistory()
  const checkoutHandler = () => {
    history.push('/payement')
  }

  const [stripeToken, setStripeToken] = useState(null)

  const onToken = (token) => {
    setStripeToken(token)
  }
  console.log(stripeToken)

  return (
    <div>
      <Container className='py-3'>
        <Row>
          <Col md={8}>
            <h1>Mes réservations</h1>
            {cartItems.length === 0 ? (
              <Message>Vous n'avez pas réserver acune aventure</Message>
            ) : (
              <ListGroup variant='flush'>
                {cartItems.map((item) => (
                  <ListGroup.Item key={item.event}>
                    <Row>
                      <Col md={2}>
                        <Image src={item.image} alt={item.name} fluid rounded />
                      </Col>
                      <Col md={3}>
                        <Link to={`/event/${item.event}`}>{item.name}</Link>
                      </Col>
                      <Col md={2}>
                        {item.price}
                        {''}dt
                      </Col>
                      <Col md={2}>
                        <select
                          className='form-select'
                          value={item.plc}
                          onChange={(e) =>
                            dispatch(
                              addToCart(item.event, Number(e.target.value))
                            )
                          }
                        >
                          {[...Array(item.numberOfPlacesLeft).keys()].map(
                            (x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            )
                          )}
                        </select>
                      </Col>
                      <Col md={2}>
                        <Button
                          type='button'
                          variant='light'
                          onClick={() => removeFromCartHandler(item.event)}
                        >
                          <i className='fas fa-trash'></i>
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>
          <Col md={4}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h4>
                    Place réservés: (
                    {cartItems.reduce((acc, item) => acc + item.plc, 0)})
                  </h4>
                  {cartItems
                    .reduce((acc, item) => acc + item.plc * item.price, 0)
                    .toFixed(2)}
                  dt
                </ListGroup.Item>
                <ListGroup.Item>
                  <StripeCheckout
                    name='eventurA'
                    billingAddress
                    description={`Totale à payer est: ${cart.itemsPrice}dt`}
                    amount={cart.itemsPrice * 100}
                    token={onToken}
                    stripeKey={KEY}
                  >
                    <Button>Poursuivre à payer</Button>
                  </StripeCheckout>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ReservationScreen
