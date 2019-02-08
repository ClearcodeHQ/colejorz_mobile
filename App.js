import React from 'react';
import { Font, AppLoading } from 'expo'
import { StyleSheet, Slider, AsyncStorage } from 'react-native';
import {
  Root,
  Container,
  Header,
  Left,
  Body,
  Right,
  Content,
  Form,
  Item,
  Input,
  Button,
  Text,
  Title,
  Toast
} from 'native-base'
import axios from 'axios'

export default class App extends React.Component {
  state = {
    connected: false,
    loading: true,
    address: 'http://10.54.54.234:6543',
    speed: 0,
  }

  async componentWillMount() {
    await Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    });
    this.setState({ loading: false })
  }

  async componentDidMount() {
    try {
      const address = await AsyncStorage.getItem('address')
      if (address !== null) {
        axios({
          method: 'GET',
          url: `${address}/state`
        })
          .then(response => this.setState({ speed: response.data.speed, connected: true }))
          .catch(err => {
            console.log('Connect error', err)
            Toast.show({ text: 'Old address outdated', duration: 1500 })
          })
      }
    } catch (error) {
      console.log('Storage error', error)
      Toast.show({ text: 'AsyncStorage error', duration: 1500 })
    }
  }

  onIPChange = (value) => {
    this.setState({ address: value })
  }

  onSubmit = () => {
    axios({
      method: 'GET',
      url: `${this.state.address}/state`,
    })
      .then(response => {
        this.setState({ speed: response.data.speed, connected: true }, async () => {
          try {
            await AsyncStorage.setItem('address', this.state.address)
          } catch (error) {
            Toast.show({ text: 'Saving address error', duration: 1500 })
          }
          Toast.show({ text: 'Connected', duration: 1500 })
        })
      })
      .catch(err => {
        console.log('err', err)
        Toast.show({ text: 'Connection error', duration: 1500 })
      })
  }

  onSpeedChange = (value) => {
    this.setState({ speed: Math.floor(value) }, this.masterRequest)
  }

  onStop = () => {
    this.setState({ speed: 0 }, this.masterRequest)
  }

  masterRequest = () => {
    axios({
      method: 'POST',
      url: `${this.state.address}/state`,
      body: {
       speed: this.state.speed,
      }
    })
      .then(() => {
        Toast.show({ text: 'Success', duration: 1500 })
      })
      .catch(err => {
        console.log('error', err)
        Toast.show({ text: 'Error', duration: 1500 })
      })
  }

  render() {
    const connectContent = (
      <Content>
        <Form style={styles.form}>
          <Item>
            <Input
              onChangeText={this.onIPChange}
              placeholder="Address (ie. http://127.0.0.1:3000)"
              value={this.state.address}
            />
          </Item>
          <Button
            full
            onPress={this.onSubmit}
            style={styles.connectButton}
            disabled={this.state.ip === null}
          >
            <Text>Connect</Text>
          </Button>
        </Form>
      </Content>
    )

    const steeringContent = (
      <Content>
        <Form style={styles.form}>
          <Text style={{ marginBottom: 10 }}>
            Speed (-100 to 100) [Current: {this.state.speed}]
          </Text>
          <Slider
            value={this.state.speed}
            minimumValue={-100}
            maximumValue={100}
            onSlidingComplete={this.onSpeedChange}
          />
          <Button
            full
            danger
            style={{ marginTop: 10 }}
            onPress={this.onStop}
          >
            <Text>Stop</Text>
          </Button>
        </Form>
      </Content>
    )
    if (this.state.loading) {
      return (
        <Root>
          <AppLoading />
        </Root>
      )
    }
    return (
      <Root>
        <Container>
          <Header>
            <Left />
            <Body>
              <Title>Colejorz</Title>
            </Body>
            <Right />
          </Header>
          {!this.state.connected ? (
            connectContent
          ) : (
            steeringContent
          )}
        </Container>
      </Root>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: 10
  },
  connectButton: {
    marginTop: 10
  }
});
