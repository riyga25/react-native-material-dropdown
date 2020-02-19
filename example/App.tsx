import React, {FC, memo, useState, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
// import Dropdown from './components/dropdown';

const TEST_DATA = [
  {label: 'label1', value: 1},
  {label: 'label2', value: 2, disabled: true},
  {label: 'label3', value: 3},
  {label: 'label4', value: 4},
  {label: 'label5', value: 5},
  {label: 'label6', value: 6},
  {label: 'label7', value: 7},
];

const colors = {
  GRAY_FONT_COLOR: '#444444',
  UNACTIVE_FONT_COLOR: '#999999',
  BORDER_COLOR: '#D9D9D9',
  RED_FONT_COLOR: '#E20000',
  SHADOW_BACKGROUND: 'rgba(41, 125, 253, 0.32)',
  SELECTED_BACKGROUND: 'rgba(41,125,253,0.08)',
};

const App: FC = memo(() => {
  const [value, setValue] = useState('');
  const error = false;
  const style = {marginHorizontal: 20, marginVertical: 30};
  const disabled = false;
  const itemNumberLines = 1;

  const propsExtractor = useCallback(props => {
    const isSelected = value === props.value;
    return {
      disabled: props.disabled,
      style: { backgroundColor: isSelected && colors.SELECTED_BACKGROUND },
    };
  },[value]);

  const renderBase = useCallback((props) => {
    return(
      <View style={{flexDirection: 'row', alignItems: 'center', position: 'relative', paddingRight: 20, minHeight: 42}}>
        <Text
            style={{lineHeight: 21}}
            numberOfLines={itemNumberLines || 1}
        >
          {props.title || props.value}
        </Text>
        <View style={{position: 'absolute', right: 0}}>
          {props.renderAccessory()}
        </View>
      </View>
    )
  },[]);

  const selectItem = useCallback(item => {
    setValue(item);
  },[setValue]);

  return(
    <SafeAreaView>
      <Text>{`Selected ${value}`}</Text>
      <Dropdown
          data={TEST_DATA}
          testID={'dropdownCall'}
          dropdownPosition={0}
          value={value}
          onChangeText={selectItem}
          propsExtractor={propsExtractor}
          itemTextStyle={styles.itemTextStyle}
          baseColor={'black'}
          itemColor={colors.GRAY_FONT_COLOR}
          selectedItemColor={'black'}
          disabledItemColor={colors.UNACTIVE_FONT_COLOR}
          dropdownOffset={styles.dropdownOffset}
          dropdownMargins={{
            min: 0,
            max: 0,
          }}
          inputContainerStyle={styles.inputContainerStyle}
          containerStyle={[
            styles.containerStyle,
            error && { borderColor: colors.RED_FONT_COLOR, borderWidth: 2 },
            style && style,
          ]}
          pickerStyle={styles.pickerStyle}
          disabled={disabled}
          renderBase={renderBase}
          disabledLineType={'none'}
          alignToContent
          itemNumberLines={itemNumberLines}
          windowPadding={{bottom: 64}} //bottomBar height
      />
    </SafeAreaView>
  )
});

const styles = StyleSheet.create({
  containerStyle: {
    borderColor: colors.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    minHeight: 42,
  },
  itemTextStyle: {
    fontSize: 16,
    lineHeight: 21,
    marginHorizontal: 20,
  },
  dropdownOffset: {
    top: 7,
    left: 0,
  },
  inputContainerStyle: {
    borderBottomColor: 'transparent',
  },
  pickerStyle: {
    backgroundColor: 'white',
    shadowColor: colors.SHADOW_BACKGROUND,
    shadowOffset: { height: 4, width: 0 },
    shadowRadius: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.BORDER_COLOR,
  },
});

export default App;
