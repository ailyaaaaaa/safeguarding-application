
//Import compnents from react-native
import { View, Text, StyleSheet} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useCommonStyles } from '@/constants/commonStyles';

//Make a functional component named 'app'
const app = () => {
   const colorScheme = useColorScheme();
  const styles = useCommonStyles();

  return(
    //Main and text containers with styles
    <View style = {styles.container}>
      <Text style = {styles.title}>Settings</Text>
    </View>
  )
}
//Export the component to be used in other files
export default app
