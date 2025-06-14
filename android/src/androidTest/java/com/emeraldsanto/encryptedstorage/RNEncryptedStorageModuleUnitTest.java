package com.emeraldsanto.encryptedstorage;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@RunWith(AndroidJUnit4.class)
public class RNEncryptedStorageModuleUnitTest {
  private RNEncryptedStorageModule module;
  private final ReadableMap options = new MockReadableMap();

  @Before
  public void setUp() {
    module = new RNEncryptedStorageModule(new ReactApplicationContext(InstrumentationRegistry.getInstrumentation().getTargetContext()));
    module.clear(options, mock(Promise.class));
  }

  @Test
  public void shouldGetAndSet() {
    Promise promise1 = mock(Promise.class);
    module.getItem("test", options, promise1);
    verify(promise1).resolve(isNull());

    Promise promise2 = mock(Promise.class);
    module.setItem("test", "asd", options, promise2);
    verify(promise2).resolve(eq("asd"));

    Promise promise3 = mock(Promise.class);
    module.getItem("test", options, promise3);
    verify(promise3).resolve(eq("asd"));
  }

  @Test
  public void shouldRemove() {
    Promise promise1 = mock(Promise.class);
    module.setItem("test", "asd", options, promise1);
    verify(promise1).resolve(eq("asd"));

    Promise promise2 = mock(Promise.class);
    module.getItem("test", options, promise2);
    verify(promise2).resolve(eq("asd"));

    Promise promise3 = mock(Promise.class);
    module.removeItem("test", options, promise3);
    verify(promise3).resolve(eq("test"));

    Promise promise4 = mock(Promise.class);
    module.getItem("test", options, promise4);
    verify(promise4).resolve(isNull());
  }

  @Test
  public void shouldClear() {
    Promise promise1 = mock(Promise.class);
    module.setItem("test", "asd", options, promise1);
    verify(promise1).resolve(eq("asd"));

    Promise promise2 = mock(Promise.class);
    module.getItem("test", options, promise2);
    verify(promise2).resolve(eq("asd"));

    Promise promise3 = mock(Promise.class);
    module.clear(options, promise3);
    verify(promise3).resolve(isNull());

    Promise promise4 = mock(Promise.class);
    module.getItem("test", options, promise4);
    verify(promise4).resolve(isNull());
  }

  @Test
  public void shouldKeepValuesWhenRecreated() {
    Promise promise1 = mock(Promise.class);
    module.setItem("test", "asd", options, promise1);
    verify(promise1).resolve(eq("asd"));

    module = new RNEncryptedStorageModule(new ReactApplicationContext(InstrumentationRegistry.getInstrumentation().getTargetContext()));

    Promise promise2 = mock(Promise.class);
    module.getItem("test", options, promise2);
    verify(promise2).resolve(eq("asd"));
  }
}
