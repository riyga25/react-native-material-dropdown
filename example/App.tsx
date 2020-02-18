import React, {FC, memo, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';

const typographyData = [
  { value: 'Display2', label: 'Display 2' },
  { value: 'Display1', label: 'Display 1' },
  { value: 'Headline' },
  { value: 'Title' },
  { value: 'Subheading' },
  { value: 'Body' },
  { value: 'Caption' },
];

const colorNameData = [
  { value: 'Blue' },
  { value: 'Teal' },
  { value: 'Cyan' },
];

const colorCodeData = [
  { value: '900', props: { disabled: true } },
  { value: '700' },
  { value: 'A700' },
  { value: 'A400' },
];

const App: FC = memo(() => {
  const [sample, setSample] = useState('The quick brown fox jumps over the lazy dog');
  const [typography, setTypography] = useState('Headline');
  const [name, setName] = useState('Cyan');
  const [code, setCode] = useState('A700');

  let textStyle = [
    styles.text,
    styles[typography],
    styles[name + code],
  ];

  return(
    <View style={styles.screen}>
      <View style={styles.container}>
        <TextField
          value={sample}
          onChangeText={setSample}
          label='Sample text'
          multiline={true}
        />

        <Dropdown
          value={typography}
          onChangeText={setTypography}
          label='Typography'
          data={typographyData}
        />

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Dropdown
              value={name}
              onChangeText={setName}
              label='Color name'
              data={colorNameData}
            />
          </View>

          <View style={{ width: 96, marginLeft: 8 }}>
            <Dropdown
              value={code}
              onChangeText={setCode}
              label='Color code'
              data={colorCodeData}
              // propsExtractor={({ props }) => props}
            />
          </View>
        </View>
      </View>

      <View style={[styles.container, styles.textContainer]}>
        <Text style={textStyle}>{sample}</Text>
      </View>
    </View>
  )
});

const styles: any = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 4,
    paddingTop: 56,
    backgroundColor: '#E8EAF6',
  },

  container: {
    marginHorizontal: 4,
    marginVertical: 8,
    paddingHorizontal: 8,
  },

  text: {
    textAlign: 'center',
  },

  textContainer: {
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 16,
    elevation: 1,
    shadowRadius: 1,
    shadowOpacity: 0.3,
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  Display2: { fontSize: 45 },
  Display1: { fontSize: 34 },
  Headline: { fontSize: 24 },
  Title: { fontSize: 20, fontWeight: '500' },
  Subheading: { fontSize: 16 },
  Body: { fontSize: 14 },
  Caption: { fontSize: 12 },

  Blue900: { color: '#0D47A1' },
  Blue700: { color: '#1976D2' },
  BlueA700: { color: '#2962FF' },
  BlueA400: { color: '#2979FF' },

  Teal900: { color: '#004D40' },
  Teal700: { color: '#00796B' },
  TealA700: { color: '#00BFA5' },
  TealA400: { color: '#1DE9B6' },

  Cyan900: { color: '#006064' },
  Cyan700: { color: '#0097A7' },
  CyanA700: { color: '#00E5FF' },
  CyanA400: { color: '#00B8D4' },
});

export default App;
