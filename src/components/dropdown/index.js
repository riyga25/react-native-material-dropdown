import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import {
  Text,
  View,
  FlatList,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  TouchableOpacity,
  ViewPropTypes,
  I18nManager,
} from "react-native";

import styles from "./styles";

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

export default class Dropdown extends PureComponent {
  constructor(props) {
    super(props);
    let { value = null } = props;

    this.updateContainerRef = this.updateRef.bind(this, "container");
    this.updateScrollRef = this.updateRef.bind(this, "scroll");
    this.blur = () => this.onClose();

    this.mounted = false;
    this.focused = false;

    this.state = {
      opacity: new Animated.Value(0),
      selected: -1,
      modal: false,
      value,
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onPress = event => {
    let {
      data,
      disabled,
      onFocus,
      itemPadding,
      dropdownOffset,
      dropdownMargins: { min: minMargin, max: maxMargin },
      animationDuration,
      absoluteRTLLayout,
      useNativeDriver,
    } = this.props;

    if (disabled) {
      return;
    }

    let timestamp = Date.now();

    if (!data.length) {
      return;
    }

    this.focused = true;

    if ("function" === typeof onFocus) {
      onFocus();
    }

    this.container.measureInWindow((x, y, containerWidth, containerHeight) => {
      let { opacity } = this.state;

      /* Adjust coordinates for relative layout in RTL locale */
      if (I18nManager.isRTL && !absoluteRTLLayout) {
        x = windowWidth - (x + containerWidth);
      }

      let delay = Math.max(
        0, animationDuration - (Date.now() - timestamp)
      );
      let selected = this.selectedIndex();

      let leftInset;
      let left = x + dropdownOffset.left - maxMargin;

      if (left > minMargin) {
        leftInset = maxMargin;
      } else {
        left = minMargin;
        leftInset = minMargin;
      }

      let right = x + containerWidth + maxMargin;
      let rightInset;

      if (windowWidth - right > minMargin) {
        rightInset = maxMargin;
      } else {
        right = windowWidth - minMargin;
        rightInset = minMargin;
      }

      let top = y + dropdownOffset.top - itemPadding;

      this.setState({
        modal: true,
        width: right - left,
        top,
        left,
        leftInset,
        rightInset,
        selected,
      });

      setTimeout(() => {
        if (this.mounted) {
          this.resetScrollOffset();

          Animated.timing(opacity, {
            duration: animationDuration,
            toValue: 1,
            useNativeDriver,
          }).start(() => {
            if (this.mounted && "ios" === Platform.OS) {
              let { flashScrollIndicators } = this.scroll || {};

              if ("function" === typeof flashScrollIndicators) {
                flashScrollIndicators.call(this.scroll);
              }
            }
          });
        }
      }, delay);
    });
  };

  onClose = (value = this.state.value) => {
    const { onBlur, animationDuration, useNativeDriver } = this.props;
    const { opacity } = this.state;

    Animated.timing(opacity, {
      duration: animationDuration,
      toValue: 0,
      useNativeDriver,
    }).start(() => {
      this.focused = false;

      if ("function" === typeof onBlur) {
        onBlur();
      }

      if (this.mounted) {
        this.setState({ value, modal: false });
      }
    });
  };

  onSelect = index => () => {
    let {
      data,
      valueExtractor,
      onChangeText,
      animationDuration,
      changeTextWithCallback,
    } = this.props;
    const value = valueExtractor(data[index], index);
    const delay = Math.max(0, animationDuration);

    const callback = (next = false) => {
      this.onClose(next ? value : null);
    };

    if(data[index].disabled){
      return;
    }

    if ("function" === typeof onChangeText) {
      if (changeTextWithCallback) {
        onChangeText({ value, index, data, callback });
      } else {
        onChangeText(value, index, data);
        setTimeout(() => this.onClose(value), delay);
      }
    }
  };

  selectedIndex = () => {
    let { value } = this.state;
    let { data, valueExtractor } = this.props;

    return data.findIndex(
      (item, index) => null != item && value === valueExtractor(item, index)
    );
  };

  itemSize = () => {
    let { fontSize, itemPadding } = this.props;

    return Math.ceil(fontSize * 1.5 + itemPadding * 2);
  };

  visibleItemCount = () => {
    let { data, itemCount } = this.props;

    return Math.min(data.length, itemCount);
  };

  tailItemCount = () => {
    return Math.max(this.visibleItemCount() - 2, 0);
  };

  resetScrollOffset = () => {
    const { selected } = this.state;
    const { data, dropdownPosition } = this.props;

    let offset = 0;
    let itemCount = data.length;
    let itemSize = this.itemSize();
    let tailItemCount = this.tailItemCount();
    let visibleItemCount = this.visibleItemCount();

    if (itemCount > visibleItemCount) {
      if (null == dropdownPosition) {
        switch (selected) {
          case -1:
            break;

          case 0:
          case 1:
            break;

          default:
            if (selected >= itemCount - tailItemCount) {
              offset = itemSize * (itemCount - visibleItemCount);
            } else {
              offset = itemSize * (selected - 1);
            }
        }
      } else {
        let index = selected - dropdownPosition;

        if (dropdownPosition < 0) {
          index -= visibleItemCount;
        }

        index = Math.max(0, index);
        index = Math.min(index, itemCount - visibleItemCount);

        if (~selected) {
          offset = itemSize * index;
        }
      }
    }

    if (this.scroll) {
      this.scroll.scrollToOffset({ offset, animated: false });
    }
  };

  updateRef = (name, ref) => {
    this[name] = ref;
  };

  keyExtractor = (item, index) => {
    let { valueExtractor } = this.props;

    return `${index}-${valueExtractor(item, index)}`;
  };

  renderBase = props => {
    const { value } = this.state;
    const {
      data,
      renderBase,
      labelExtractor,
      renderAccessory = this.renderAccessory,
    } = this.props;

    let index = this.selectedIndex();
    let title;

    if (~index) {
      title = labelExtractor(data[index], index);
    }

    if (!title && value) {
      title = value;
    }

    if ("function" === typeof renderBase) {
      return renderBase({ ...props, title, value, renderAccessory });
    }
  };

  renderAccessory = () => {
    let { baseColor: backgroundColor } = this.props;
    let triangleStyle = { backgroundColor };

    return (
      <View style={styles.accessory}>
        <View style={styles.triangleContainer}>
          <View style={[styles.triangle, triangleStyle]} />
        </View>
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    if (!item) {return null}

    let { selected, leftInset, rightInset } = this.state;
    let {
      valueExtractor,
      labelExtractor,
      propsExtractor,
      textColor,
      itemColor,
      baseColor,
      selectedItemColor = textColor,
      disabledItemColor = baseColor,
      fontSize,
      itemTextStyle,
      shadeOpacity,
      itemNumberLines,
    } = this.props;

    let props = propsExtractor(item, index);

    let { style, disabled } = (props = {
      shadeOpacity,
      ...props,
    });

    let value = valueExtractor(item, index);
    let label = labelExtractor(item, index);

    let title = null == label ? value : label;

    let color = disabled
      ? disabledItemColor
      : ~selected
      ? index === selected
        ? selectedItemColor
        : itemColor
      : selectedItemColor;

    let textStyle = { color, fontSize };

    props.style = [
      style,
      {
        paddingLeft: leftInset,
        paddingRight: rightInset,
        minHeight: 40,
        justifyContent: 'center',
      },
    ];

    return(
      <TouchableOpacity
        underlayColor={'rgba(0,0,0,0.2)'}
        onPress={this.onSelect(index)}
        style={props.style}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.item, itemTextStyle, textStyle]}
          numberOfLines={itemNumberLines || 1}
        >
          {title}
        </Text>
      </TouchableOpacity>
    )
  };

  render() {
    let {
      containerStyle,
      overlayStyle: overlayStyleOverrides,
      pickerStyle: pickerStyleOverrides,

      hitSlop,
      pressRetentionOffset,
      testID,
      nativeID,
      accessible,
      accessibilityLabel,

      supportedOrientations,

      alignToContent,
      windowPadding,

      data,
      disabled,
      itemPadding,
      dropdownPosition,
    } = this.props;

    const baseProps = {
      data,
      disabled,
      itemPadding,
      dropdownPosition,
    };

    const { left, top, width, opacity, selected, modal } = this.state;

    const itemCount = data.length;
    const visibleItemCount = this.visibleItemCount();
    const tailItemCount = this.tailItemCount();
    const itemSize = this.itemSize();
    const height = 2 * itemPadding + itemSize * visibleItemCount;
    let translateY = -itemPadding;

    if(alignToContent){
      if(windowHeight < height + top + windowPadding.bottom){
        dropdownPosition = visibleItemCount
      }
    }

    if (null == dropdownPosition) {
      switch (selected) {
        case -1:
          translateY -= 1 === itemCount ? 0 : itemSize;
          break;

        case 0:
          break;

        default:
          if (selected >= itemCount - tailItemCount) {
            translateY -=
              itemSize * (visibleItemCount - (itemCount - selected));
          } else {
            translateY -= itemSize;
          }
      }
    } else {
      if (dropdownPosition < 0) {
        translateY -= itemSize * (visibleItemCount + dropdownPosition);
      } else {
        translateY -= itemSize * dropdownPosition;
      }
    }

    let overlayStyle = { opacity };

    let pickerStyle = {
      width,
      height,
      top,
      left,
      transform: [{ translateY }],
    };

    let touchableProps = {
      disabled,
      hitSlop,
      pressRetentionOffset,
      onPress: this.onPress,
      testID,
      nativeID,
      accessible,
      accessibilityLabel,
    };

    return (
      <View
        ref={this.updateContainerRef}
        style={containerStyle}
      >
        <TouchableWithoutFeedback
          accessibilityState={{ disabled }}
          {...touchableProps}
        >
          <View pointerEvents="box-only">
            {this.renderBase(baseProps)}
          </View>
        </TouchableWithoutFeedback>

        <Modal
          visible={modal}
          transparent={true}
          onRequestClose={this.blur}
          supportedOrientations={supportedOrientations}
        >
          <Animated.View
            style={[styles.overlay, overlayStyle, overlayStyleOverrides]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={this.blur}
          >
            <View
              style={[styles.picker, pickerStyle, pickerStyleOverrides]}
              onStartShouldSetResponder={() => true}
            >
              <FlatList
                ref={this.updateScrollRef}
                data={data}
                testID={"dropdownList"}
                accessibilityLabel={"dropdownList"}
                style={styles.scroll}
                renderItem={this.renderItem}
                keyExtractor={this.keyExtractor}
                scrollEnabled={visibleItemCount < itemCount}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator
              />
            </View>
          </Animated.View>
        </Modal>
      </View>
    );
  }
}

Dropdown.propTypes = {
  ...TouchableWithoutFeedback.propTypes,

  disabled: PropTypes.bool,

  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  data: PropTypes.arrayOf(PropTypes.object),

  valueExtractor: PropTypes.func,
  labelExtractor: PropTypes.func,
  propsExtractor: PropTypes.func,

  absoluteRTLLayout: PropTypes.bool,
  changeTextWithCallback: PropTypes.bool,
  alignToContent: PropTypes.bool,

  dropdownOffset: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),

  dropdownMargins: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }),

  windowPadding: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    bottom: PropTypes.number,
    right: PropTypes.number,
  }),

  dropdownPosition: PropTypes.number,

  shadeOpacity: PropTypes.number,

  animationDuration: PropTypes.number,

  fontSize: PropTypes.number,

  textColor: PropTypes.string,
  itemColor: PropTypes.string,
  selectedItemColor: PropTypes.string,
  disabledItemColor: PropTypes.string,
  baseColor: PropTypes.string,

  itemTextStyle: Text.propTypes.style,

  itemCount: PropTypes.number,
  itemPadding: PropTypes.number,

  onLayout: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChangeText: PropTypes.func,

  renderBase: PropTypes.func,
  renderAccessory: PropTypes.func,

  containerStyle: (ViewPropTypes || View.propTypes).style,
  overlayStyle: (ViewPropTypes || View.propTypes).style,
  pickerStyle: (ViewPropTypes || View.propTypes).style,

  supportedOrientations: PropTypes.arrayOf(PropTypes.string),

  useNativeDriver: PropTypes.bool,
  itemNumberLines: PropTypes.bool,
};

Dropdown.defaultProps = {
  hitSlop: { top: 6, right: 4, bottom: 6, left: 4 },

  disabled: false,

  data: [],

  valueExtractor: ({ value } = {}) => value,
  labelExtractor: ({ label } = {}) => label,
  propsExtractor: () => null,

  absoluteRTLLayout: false,
  changeTextWithCallback: false,

  dropdownOffset: {
    top: 32,
    left: 0,
  },

  dropdownMargins: {
    min: 8,
    max: 16,
  },

  windowPadding: {
    bottom: 0, //now using only this direction
    top: 0,
    left: 0,
    right: 0,
  },

  shadeOpacity: 0.12,
  animationDuration: 225,
  fontSize: 16,
  textColor: "rgba(0, 0, 0, .87)",
  itemColor: "rgba(0, 0, 0, .54)",
  baseColor: "rgba(0, 0, 0, .38)",

  itemCount: 4,
  itemPadding: 8,

  supportedOrientations: [
    "portrait",
    "portrait-upside-down",
    "landscape",
    "landscape-left",
    "landscape-right",
  ],

  useNativeDriver: false,
};
