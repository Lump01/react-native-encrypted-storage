//
//  RNEncryptedStorage.m
//  EncryptedStorage
//
//  Created by Yanick Bélanger on 2020-02-09.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "RNEncryptedStorage.h"
#import <Security/Security.h>

@implementation RNEncryptedStorage

RCT_EXPORT_MODULE();

- (NSString *)getStorageName:(NSDictionary *)options {
    NSString *bundleId = [[NSBundle mainBundle] bundleIdentifier];
    NSString *storageName = options[@"storageName"] ? options[@"storageName"] : bundleId;
    return storageName;
}

- (NSString *)getKeychainAccessibility:(NSDictionary *)options {
    NSString *accessibility = options[@"keychainAccessibility"];
    return accessibility ? accessibility : (__bridge NSString *)kSecAttrAccessibleAfterFirstUnlock;
}

- (NSMutableDictionary *)getKeychainQuery:(NSString *)key options:(NSDictionary *)options {
    NSString *storageName = [self getStorageName:options];
    NSString *accessibility = [self getKeychainAccessibility:options];

    NSMutableDictionary *query = [[NSMutableDictionary alloc] init];
    [query setObject:(__bridge id)kSecClassGenericPassword forKey:(__bridge id)kSecClass];
    [query setObject:storageName forKey:(__bridge id)kSecAttrService];
    [query setObject:key forKey:(__bridge id)kSecAttrAccount];
    [query setObject:(__bridge id)[accessibility UTF8String] forKey:(__bridge id)kSecAttrAccessible];

    return query;
}

RCT_EXPORT_METHOD(setItem:(NSString *)key
        value:(NSString *)value
        options:(NSDictionary *)options
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject) {

    NSMutableDictionary *query = [self getKeychainQuery:key options:options];

    // First, delete any existing item
    SecItemDelete((__bridge CFDictionaryRef)query);

    // Add the new item
    NSData *valueData = [value dataUsingEncoding:NSUTF8StringEncoding];
    [query setObject:valueData forKey:(__bridge id)kSecValueData];

    OSStatus status = SecItemAdd((__bridge CFDictionaryRef)query, NULL);

    if (status == errSecSuccess) {
        resolve(nil);
    } else {
        NSString *errorMessage = [NSString stringWithFormat:@"Failed to save item with key '%@'. OSStatus: %d", key, (int)status];
        reject(@"keychain_error", errorMessage, nil);
    }
}

RCT_EXPORT_METHOD(getItem:(NSString *)key
        options:(NSDictionary *)options
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject) {

    NSMutableDictionary *query = [self getKeychainQuery:key options:options];
    [query setObject:(__bridge id)kSecReturnData forKey:(__bridge id)kSecReturnData];
    [query setObject:(__bridge id)kSecMatchLimitOne forKey:(__bridge id)kSecMatchLimit];

    CFTypeRef result = NULL;
    OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &result);

    if (status == errSecSuccess && result != NULL) {
        NSData *data = (__bridge_transfer NSData *)result;
        NSString *value = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        resolve(value);
    } else if (status == errSecItemNotFound) {
        resolve([NSNull null]);
    } else {
        NSString *errorMessage = [NSString stringWithFormat:@"Failed to retrieve item with key '%@'. OSStatus: %d", key, (int)status];
        reject(@"keychain_error", errorMessage, nil);
    }
}

RCT_EXPORT_METHOD(removeItem:(NSString *)key
        options:(NSDictionary *)options
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject) {

    NSMutableDictionary *query = [self getKeychainQuery:key options:options];

    OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);

    if (status == errSecSuccess || status == errSecItemNotFound) {
        resolve(nil);
    } else {
        NSString *errorMessage = [NSString stringWithFormat:@"Failed to remove item with key '%@'. OSStatus: %d", key, (int)status];
        reject(@"keychain_error", errorMessage, nil);
    }
}

RCT_EXPORT_METHOD(clear:(NSDictionary *)options
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject) {

    NSString *storageName = [self getStorageName:options];

    NSMutableDictionary *query = [[NSMutableDictionary alloc] init];
    [query setObject:(__bridge id)kSecClassGenericPassword forKey:(__bridge id)kSecClass];
    [query setObject:storageName forKey:(__bridge id)kSecAttrService];

    OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);

    if (status == errSecSuccess || status == errSecItemNotFound) {
        resolve([NSNull null]);
    } else {
        NSString *errorMessage = [NSString stringWithFormat:@"Failed to clear storage '%@'. OSStatus: %d", storageName, (int)status];
        reject(@"keychain_error", errorMessage, nil);
    }
}

// Required for RN 0.60+
+ (BOOL)requiresMainQueueSetup {
    return NO;
}

@end
