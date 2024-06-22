import { Context, Scenes } from 'telegraf';

export interface MySceneSession extends Scenes.SceneSessionData {
  // will be available under `ctx.scene.session.mySceneSessionProp`
  sceneSessionProp: number;
}

/**
 * We can still extend the regular session object that we can use on the
 * context. However, as we're using scenes, we have to make it extend
 * `SceneSession`.
 *
 * It is possible to pass a type variable to `SceneSession` if you also want to
 * extend the scene session as we do above.
 */
export interface MySession extends Scenes.SceneSession<MySceneSession> {
  // will be available under `ctx.session.mySessionProp`
  sessionProp: number;
}

/**
 * Now that we have our session object, we can define our own context object.
 *
 * As always, if we also want to use our own session object, we have to set it
 * here under the `session` property. In addition, we now also have to set the
 * scene object under the `scene` property. As we extend the scene session, we
 * need to pass the type in as a type variable once again.
 */
export interface MyContext extends Context {
  // will be available under `ctx.myContextProp`
  contextProp: string;

  // declare session type
  session: MySession;
  // declare scene type
  scene: Scenes.SceneContextScene<MyContext, MySceneSession>;
}
