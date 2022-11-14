/**
 * Copyright (c) 2019 Hetzner Cloud GmbH
 *
 * SPDX-License-Identifier: MIT
 */

import {
    TestBed,
    TestModuleMetadata,
} from '@angular/core/testing';
import { Type } from '@angular/core';

/**
 * Prepares the testing environment by precompiling components.
 *
 * @param configs Config for configuring testing module
 * @param templateOverride Optional: Override the template of the given Type with an empty string
 */
export function prepareTestEnvironment(
    ...configs: (TestModuleMetadata | Type<any>)[]
): void {
    const template: Type<any> | null =
        configs[configs.length - 1] instanceof Type
            ? (configs.pop() as Type<any>)
            : null;

    beforeEach(() =>
        (async (): Promise<void> => {
            for (const config of configs as TestModuleMetadata[]) {
                TestBed.configureTestingModule(config);
            }

            if (template !== null) {
                TestBed.overrideTemplate(template, '');
            }
            await TestBed.compileComponents();
        })()
    );
}
