
//Import compnents from react-native
import { View, Text, StyleSheet} from 'react-native';

//Make a functional component named 'app'
const app = () => {
  return(
    //Main and text containers with styles
    <View style = {styles.container}>
      <Text style = {styles.text}>Settings</Text>
    </View>
  )
}
//Export the component to be used in other files
export default app

//Create styles using StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    color: 'grey',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 450,
  }
})
