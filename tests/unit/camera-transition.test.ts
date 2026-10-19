import {describe,expect,it} from 'vitest';
import {cameraTransitionDuration,easeInOutCubic,safeFocusDistance,transitionVisibility} from '../../app/camera-transition';

describe('camera transition planning',()=>{
 it('uses a smooth bounded easing curve',()=>{expect(easeInOutCubic(0)).toBe(0);expect(easeInOutCubic(.5)).toBe(.5);expect(easeInOutCubic(1)).toBe(1);});
 it('keeps normal motion between 0.9 and 1.6 seconds and honors reduced motion',()=>{expect(cameraTransitionDuration(0)).toBeGreaterThanOrEqual(.9);expect(cameraTransitionDuration(99)).toBe(1.6);expect(cameraTransitionDuration(2,true)).toBe(0);});
 it('backs farther away for long structures and narrow viewports',()=>{const compact=safeFocusDistance([.1,.1,.1],34,900,700);const long=safeFocusDistance([.1,1.2,.1],34,900,700);const narrow=safeFocusDistance([.7,.2,.1],34,320,700);expect(long).toBeGreaterThan(compact);expect(narrow).toBeGreaterThan(compact);});
 it('keeps context first, then lowers non-target structures without removing them',()=>{expect(transitionVisibility(.2,false,true)).toBe(1);expect(transitionVisibility(.6,false,true)).toBeGreaterThan(.015);expect(transitionVisibility(1,false,true)).toBeCloseTo(.015);expect(transitionVisibility(1,true,true)).toBe(1);});
});
