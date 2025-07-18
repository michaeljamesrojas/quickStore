import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScannerScreen from '../app/(tabs)/scanner';
import { useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View, Button } = require('react-native');

  return {
    ...jest.requireActual('expo-camera'),
    useCameraPermissions: jest.fn(),
    CameraView: ({ onBarcodeScanned, ...props }: any) => {
      const handlePress = () => {
        if (onBarcodeScanned) {
          onBarcodeScanned({ data: 'test-qr-code' });
        }
      };
      return (
        <View {...props}>
          <Button title="Simulate Scan" onPress={handlePress} testID="scan-button" />
        </View>
      );
    },
  };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: jest.fn(),
}));

describe('ScannerScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders permission request when no permission is granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([null, jest.fn()]);
    (useIsFocused as jest.Mock).mockReturnValue(true);

    const { getByText } = render(<ScannerScreen />);
    expect(getByText('Camera permission is required.')).toBeTruthy();
    expect(getByText('Grant Permission')).toBeTruthy();
  });

  it('renders camera when permission is granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (useIsFocused as jest.Mock).mockReturnValue(true);

    const { getByTestId } = render(<ScannerScreen />);
    expect(getByTestId('scan-button')).toBeTruthy();
  });

  it('shows scanned data after a scan', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (useIsFocused as jest.Mock).mockReturnValue(true);

    const { getByTestId, findByText } = render(<ScannerScreen />);

    fireEvent.press(getByTestId('scan-button'));

    const resultText = await findByText('Scanned: test-qr-code');
    expect(resultText).toBeTruthy();

    const scanAgainButton = await findByText('Scan Again');
    expect(scanAgainButton).toBeTruthy();
  });

  it('can scan again after a successful scan', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (useIsFocused as jest.Mock).mockReturnValue(true);

    const { getByTestId, findByText, queryByText } = render(<ScannerScreen />);

    fireEvent.press(getByTestId('scan-button'));

    const resultText = await findByText('Scanned: test-qr-code');
    expect(resultText).toBeTruthy();

    const scanAgainButton = await findByText('Scan Again');
    fireEvent.press(scanAgainButton);

    expect(queryByText('Scanned: test-qr-code')).toBeNull();
    expect(getByTestId('scan-button')).toBeTruthy();
  });
});
