import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import { connect } from 'react-redux';
import color from '../../assets/styles/color';
import OperationHeader from '../../components/headers/header.operation';
import Loc from '../../components/common/misc/loc';
import { strings } from '../../common/i18n';
import BasePageSimple from '../base/base.page.simple';
import apiHelper from '../../common/apiHelper';
import common from '../../common/common';

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    backgroundColor: color.white,
  },
  authorizationContainer: {
    backgroundColor: color.white,
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorizationText: {
    position: 'absolute',
    fontFamily: 'Avenir-Roman',
    fontSize: 17,
    bottom: '55%',
    marginHorizontal: 45,
    textAlign: 'center',
    lineHeight: 30,
  },
});

const UnauthorizationView = () => (
  <View style={styles.authorizationContainer}>
    <Loc style={styles.unauthorizationText} text="page.wallet.scan.unauthorization" />
  </View>
);

const PendingView = () => (
  <View style={styles.authorizationContainer}>
    <ActivityIndicator size="small" />
  </View>
);

class Scan extends Component {
    static navigationOptions = () => ({
      header: null,
    });

    constructor(props) {
      super(props);
      this.isScanFinished = false;
    }

    onBarCodeRead = (scanResult) => {
      const { data } = scanResult;
      if (this.isScanFinished) {
        return;
      }
      this.isScanFinished = true;
      console.log(`scanResult: ${JSON.stringify(scanResult)}`);
      this.onQrcodeDetected(data);
    }

    onQrcodeDetected = (data) => {
      const { navigation } = this.props;
      const { wallet } = navigation.state.params;

      if (data.startsWith('wc:')) {
        navigation.navigate('WalletConnectionPage', { uri: data, wallet });
      } else {
        navigation.navigate('SelectWallet', {
          operation: 'scan',
          wallet,
          onDetectedAction: 'navigateToTransfer',
          toAddress: data,
        });
      }
    }

    render() {
      const { navigation } = this.props;
      const barcodeMask = (<BarcodeMask width={240} height={240} edgeBorderWidth={1} showAnimatedLine={false} />);
      const scanner = (
        <RNCamera
          ref={(ref) => { this.camera = ref; }}
          captureAudio={false}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          androidCameraPermissionOptions={{
            title: strings('page.wallet.scan.cameraPermission.title'),
            message: strings('page.wallet.scan.cameraPermission.message'),
            buttonPositive: strings('button.ok'),
            buttonNegative: strings('button.cancel'),
          }}
          onBarCodeRead={this.onBarCodeRead}
        >
          {({ status }) => {
            if (status === 'PENDING_AUTHORIZATION') {
              return <PendingView />;
            }
            if (status === 'NOT_AUTHORIZED') {
              return <UnauthorizationView />;
            }
            return barcodeMask;
          }}
        </RNCamera>
      );

      return (
        <BasePageSimple
          isSafeView={false}
          headerComponent={<OperationHeader title={strings('page.wallet.scan.title')} onBackButtonPress={() => navigation.goBack()} />}
        >
          <View style={styles.body}>
            {scanner}
          </View>
        </BasePageSimple>
      );
    }
}

Scan.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    state: PropTypes.object.isRequired,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  language: state.App.get('language'),
});

export default connect(mapStateToProps)(Scan);
