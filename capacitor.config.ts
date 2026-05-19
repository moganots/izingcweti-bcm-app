import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.izingcweti.bcm.app',
    appName: 'Izingcweti BCM App',
    webDir: 'dist/spa',
    server: {
        androidScheme: 'https',
        iosScheme: 'https',
        cleartext: true,
        allowNavigation: ['*'],
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 3000,
            launchAutoHide: true,
            launchFadeOutDuration: 500,
            backgroundColor: '#1a73e8',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: true,
            spinnerColor: '#ffffff',
            splashFullScreen: true,
            splashImmersive: true,
        },
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#1a73e8',
            overlaysWebView: false,
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert'],
        },
        Keyboard: {
            // resize: 'body',
            // style: 'DARK',
            resizeOnFullScreen: true,
        },
        App: {
            backgroundColor: '#1a73e8',
        },
        LocalNotifications: {
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#1a73e8',
        },
        Camera: {
            saveToGallery: false,
        },
        Filesystem: {
            androidDirectory: 'Documents',
        },
    },
    android: {
        allowMixedContent: true,
        captureInput: true,
        webContentsDebuggingEnabled: true,
        backgroundColor: '#1a73e8',
        buildOptions: {
            keystorePath: 'izingcweti-bcm.keystore',
            keystoreAlias: 'izingcweti-bcm',
            keystorePassword: 'bcm360',
        },
    },
    ios: {
        contentInset: 'automatic',
        allowsLinkPreview: false,
        backgroundColor: '#1a73e8',
        scheme: 'IzingcwetiBCM',
    },
}

export default config
