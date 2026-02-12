//
// UnityBridge.h
// Call these C functions from Unity's native plugin (iOS) when sending messages to the React Native app.
// GameObject Name: MessageSent, Event Name: SocketConnectedGame → use YallaGainSendMessageToAppWithGameObject("MessageSent", "SocketConnectedGame")
//

#ifndef UnityBridge_h
#define UnityBridge_h

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/// Send a single message string to the app (e.g. "SocketConnectedGame").
void YallaGainSendMessageToApp(const char *message);

/// Send message with GameObject name (e.g. gameObject "MessageSent", message "SocketConnectedGame").
void YallaGainSendMessageToAppWithGameObject(const char *gameObject, const char *message);

#ifdef __cplusplus
}
#endif

#endif /* UnityBridge_h */
