#include <jni.h>
#include <signal.h>
#include <string.h>
#include <unistd.h>
#include <android/log.h>
#include <pthread.h>

#define LOG_TAG "CrashHandler"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static JavaVM* gJvm = nullptr;
static jobject gApplicationContext = nullptr;
static struct sigaction gOldSigSegvHandler;
static struct sigaction gOldSigAbrtHandler;

static void restartApp() {
    if (gJvm == nullptr || gApplicationContext == nullptr) {
        LOGE("Cannot restart: JVM or context is null");
        return;
    }

    JNIEnv* env = nullptr;
    bool attached = false;

    int status = gJvm->GetEnv((void**)&env, JNI_VERSION_1_6);
    if (status == JNI_EDETACHED) {
        if (gJvm->AttachCurrentThread(&env, nullptr) == JNI_OK) {
            attached = true;
        } else {
            LOGE("Cannot attach to JVM");
            return;
        }
    }

    // Get PackageManager and launch intent
    jclass contextClass = env->FindClass("android/content/Context");
    jmethodID getPackageNameMethod = env->GetMethodID(contextClass, "getPackageName", "()Ljava/lang/String;");
    jmethodID getPackageManagerMethod = env->GetMethodID(contextClass, "getPackageManager", "()Landroid/content/pm/PackageManager;");

    jobject packageManager = env->CallObjectMethod(gApplicationContext, getPackageManagerMethod);
    jstring packageName = (jstring)env->CallObjectMethod(gApplicationContext, getPackageNameMethod);

    jclass pmClass = env->FindClass("android/content/pm/PackageManager");
    jmethodID getLaunchIntentMethod = env->GetMethodID(pmClass, "getLaunchIntentForPackage", "(Ljava/lang/String;)Landroid/content/Intent;");
    jobject launchIntent = env->CallObjectMethod(packageManager, getLaunchIntentMethod, packageName);

    if (launchIntent != nullptr) {
        // Add flags to clear the task
        jclass intentClass = env->FindClass("android/content/Intent");
        jmethodID addFlagsMethod = env->GetMethodID(intentClass, "addFlags", "(I)Landroid/content/Intent;");
        // FLAG_ACTIVITY_CLEAR_TOP | FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK
        env->CallObjectMethod(launchIntent, addFlagsMethod, 0x04000000 | 0x10000000 | 0x00008000);

        jmethodID startActivityMethod = env->GetMethodID(contextClass, "startActivity", "(Landroid/content/Intent;)V");
        env->CallVoidMethod(gApplicationContext, startActivityMethod, launchIntent);

        LOGI("App restart intent sent");
    } else {
        LOGE("Could not get launch intent");
    }

    if (attached) {
        gJvm->DetachCurrentThread();
    }
}

static void signalHandler(int sig, siginfo_t* info, void* context) {
    LOGE("Caught signal %d — checking if Unity thread", sig);

    // Check if we're on a Unity thread
    char threadName[64] = {0};
    pthread_getname_np(pthread_self(), threadName, sizeof(threadName));
    LOGE("Signal on thread: %s", threadName);

    bool isUnityThread = (strstr(threadName, "Unity") != nullptr ||
                          strstr(threadName, "unity") != nullptr ||
                          strstr(threadName, "il2cpp") != nullptr);

    if (isUnityThread) {
        LOGI("Unity thread crashed (%s) — restarting app gracefully", threadName);
        restartApp();
        // Give the restart intent time to be processed
        usleep(500000); // 500ms
        // Kill this process cleanly
        _exit(0);
    } else {
        // Not a Unity thread — use the original handler
        LOGE("Non-Unity thread signal — using original handler");
        if (sig == SIGSEGV && gOldSigSegvHandler.sa_sigaction) {
            gOldSigSegvHandler.sa_sigaction(sig, info, context);
        } else if (sig == SIGABRT && gOldSigAbrtHandler.sa_sigaction) {
            gOldSigAbrtHandler.sa_sigaction(sig, info, context);
        } else {
            _exit(sig);
        }
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_blitzapp_yallagain_CrashHandlerHelper_installCrashHandler(
        JNIEnv* env, jobject /* this */, jobject applicationContext) {

    LOGI("Installing Unity crash handler");

    env->GetJavaVM(&gJvm);
    gApplicationContext = env->NewGlobalRef(applicationContext);

    struct sigaction sa;
    memset(&sa, 0, sizeof(sa));
    sa.sa_sigaction = signalHandler;
    sa.sa_flags = SA_SIGINFO | SA_ONSTACK;
    sigemptyset(&sa.sa_mask);

    sigaction(SIGSEGV, &sa, &gOldSigSegvHandler);
    sigaction(SIGABRT, &sa, &gOldSigAbrtHandler);

    LOGI("Unity crash handler installed for SIGSEGV and SIGABRT");
}
