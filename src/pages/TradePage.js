import React, { Component, Fragment } from 'react'
import { inject, observer } from 'mobx-react'
import { compose } from 'recompose'

import { Grid, Row, Col } from 'react-bootstrap'
import { ProgressBar } from 'react-bootstrap'
import TokenInfo from '../components/Trade/TokenInfo'
import Resource from '../components/Trade/Resource'
import OrderList from '../components/Trade/OrderList'
import Order from '../components/Trade/Order'
import TradingChart from '../components/Trade/TradingChart'
import Market from '../components/Trade/Market'
import Wallet from '../components/Trade/Wallet'
import { ORDER_PAGE_LIMIT } from '../constants/Values'
import OrderHistory from '../components/Trade/OrderHistory'
import InOrder from '../components/Trade/InOrder'

class TradePage extends Component {
  constructor(props) {
    super(props)
    const { token } = this.props.match.params

    this.state = {
      token: token,
      ordersIntervalId: 0,
      chartIntervalId: 0,
      getInOrdersAndHistoryIntervalId: 0
    }
  }

  componentWillMount = async () => {
    const { marketStore, tradeStore } = this.props

    tradeStore.setTokenSymbol(this.state.token)

    await marketStore.getTokensBySymbol(this.state.token)
  }

  componentDidMount = async () => {
    const { tradeStore } = this.props

    const ordersIntervalId = setInterval(async () => {
      await tradeStore.getBuyOrders(1, ORDER_PAGE_LIMIT)
      await tradeStore.getSellOrders(1, ORDER_PAGE_LIMIT)
    }, 2000)

    const chartIntervalId = setInterval(async () => {
      await tradeStore.getChartData()
    }, 5000)

    this.setState({
      ordersIntervalId: ordersIntervalId,
      chartIntervalId: chartIntervalId
    })
  }

  componentWillUnmount = () => {
    if (this.state.ordersIntervalId > 0) {
      clearInterval(this.state.ordersIntervalId)
    }

    if (this.state.chartIntervalId > 0) {
      clearInterval(this.state.chartIntervalId)
    }
  }

  render() {
    const { accountStore, marketStore, tradeStore, eosioStore } = this.props
    const token = marketStore.token
      ? marketStore.token.data
        ? marketStore.token.data.token
        : null
      : null
    const { buyOrdersList, sellOrdersList, inOrdersList, ordersHistoryList, chartData } = tradeStore

    return (
      <Fragment>
        {token ? (
          <Grid>
            <Row>
              <Col xs={12} md={8} style={{ background: '#a9a9a9' }}>
                <TokenInfo marketStore={marketStore} token={this.state.token} />
              </Col>
              <Col xs={12} md={4} style={{ background: '#90bab9' }}>
                <Resource accountStore={accountStore} />
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={3} style={{ background: '#00a9a9' }}>
                {!buyOrdersList && !sellOrdersList ? (
                  <ProgressBar striped bsStyle="success" now={40} />
                ) : (
                  <OrderList
                    accountStore={accountStore}
                    tradeStore={tradeStore}
                    buyOrdersList={buyOrdersList}
                    sellOrdersList={sellOrdersList}
                    token={token}
                  />
                )}
              </Col>
              <Col xs={12} md={9}>
                <Row>
                  <Col xs={12} md={8} style={{ background: '#a9aaa9' }}>
                    {chartData && <TradingChart tradeStore={tradeStore} chartData={chartData} />}
                  </Col>
                  <Col xs={12} md={4} style={{ background: '#a9a909' }}>
                    <Market marketStore={marketStore} />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} style={{ background: '#aaff88' }}>
                    <Order
                      token={token}
                      accountStore={accountStore}
                      tradeStore={tradeStore}
                      eosioStore={eosioStore}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={8}>
                <Row>
                  <Col xs={12} style={{ background: '#aaaaa9' }}>
                    <InOrder />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} style={{ background: '#00a9a9' }}>
                    <OrderHistory />
                  </Col>
                </Row>
              </Col>
              <Col xs={12} md={4} style={{ background: '#90bab9' }}>
                <Wallet accountStore={accountStore} marketStore={marketStore} />
              </Col>
            </Row>
          </Grid>
        ) : (
          ''
        )}
      </Fragment>
    )
  }
}

export default compose(
  inject('marketStore', 'eosioStore', 'tradeStore', 'accountStore'),
  observer
)(TradePage)
