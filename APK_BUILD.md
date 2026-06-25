# SudanZon APK Build

تم تجهيز تطبيق Android باستخدام Capacitor.

## نوع التطبيق

التطبيق الحالي هو WebView APK يفتح موقع:

```text
https://demo.sudanzon.com
```

ويستخدم API:

```text
https://api.sudanzon.com
```

## المتطلبات

1. تثبيت Android Studio.
2. تثبيت JDK أو استخدام Java المرفقة مع Android Studio.
3. فتح المجلد:

```text
C:\wamp64\www\sudanzon-frontend\android
```

## بناء APK من Android Studio

1. افتح Android Studio.
2. اختر Open.
3. افتح المجلد:

```text
C:\wamp64\www\sudanzon-frontend\android
```

4. انتظر Gradle Sync.
5. من القائمة اختر:

```text
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

6. ستجد الملف غالبًا هنا:

```text
C:\wamp64\www\sudanzon-frontend\android\app\build\outputs\apk\debug\app-debug.apk
```

## بناء APK من PowerShell بعد ضبط Java

```powershell
cd C:\wamp64\www\sudanzon-frontend\android
.\gradlew.bat assembleDebug
```

## تحديث التطبيق بعد أي تعديل في الواجهة

```powershell
cd C:\wamp64\www\sudanzon-frontend
npm run android:sync
```

ثم أعد بناء APK من Android Studio.

## ملاحظة

إذا ظهر الخطأ التالي:

```text
JAVA_HOME is not set and no 'java' command could be found in your PATH
```

فهذا يعني أن Java غير مثبتة أو غير مضبوطة في متغيرات النظام.
