/**
 * Copyright (c) 2019 Hetzner Cloud GmbH
 *
 * SPDX-License-Identifier: MIT
 */

import {
    ComponentFixture,
    getTestBed,
    TestBed,
    TestModuleMetadata,
} from '@angular/core/testing';
import { Type } from '@angular/core';

/**
 * Prepares the testing environment by precompiling components and ensuring that
 * the TestingModule will not be entirely reset for TestBedViewEngine.
 * For the new TestBedRender3 coming with ivy we reduce the boilerplate code
 *
 * @param config Config for configuring testing module
 * @param templateOverride Optional: Override the template of the given Type with an empty string
 */
export function prepareTestEnvironment(
    ...configs: (TestModuleMetadata | Type<any>)[]
): void {
    const testBedApi: any = getTestBed();
    const template: Type<any> =
        configs[configs.length - 1] instanceof Type
            ? (configs.pop() as Type<any>)
            : null;

    if (testBedApi._instantiated === undefined) {
        // _instantiated does not exist any more with TestBedRender3 ak ivy
        // implement the default mechanism which is very similar to
        // that one which get's created by the angular-cli
        beforeEach((done: DoneFn) =>
            (async (): Promise<void> => {
                for (const config of configs as TestModuleMetadata[]) {
                    TestBed.configureTestingModule(config);
                }

                if (template !== null) {
                    TestBed.overrideTemplate(template, '');
                }
                TestBed.compileComponents();
            })()
                .then(done)
                .catch(done.fail)
        );
    } else {
        const originReset: () => typeof TestBed = TestBed.resetTestingModule;

        beforeAll((done: DoneFn) =>
            (async (): Promise<void> => {
                TestBed.resetTestingModule();
                TestBed.resetTestingModule = (): typeof TestBed => {
                    testBedApi._activeFixtures.forEach(
                        (fixture: ComponentFixture<any>) => fixture.destroy()
                    );
                    testBedApi._instantiated = false;
                    return TestBed;
                };

                TestBed.configureCompiler({
                    preserveWhitespaces: false,
                } as any);

                for (const config of configs as TestModuleMetadata[]) {
                    TestBed.configureTestingModule(config);
                }

                if (template !== null) {
                    TestBed.overrideTemplate(template, '');
                }

                await TestBed.compileComponents();
            })()
                .then(done)
                .catch(done.fail)
        );

        afterAll(() => {
            TestBed.resetTestingModule = originReset;
            TestBed.resetTestingModule();
        });
    }
}
