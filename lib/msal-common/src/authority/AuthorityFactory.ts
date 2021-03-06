/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Authority } from "./Authority";
import { ClientConfigurationError } from "../error/ClientConfigurationError";
import { INetworkModule } from "./../network/INetworkModule";
import { StringUtils } from "./../utils/StringUtils";
import { ClientAuthError } from "../error/ClientAuthError";

export class AuthorityFactory {

    /**
     * Create an authority object of the correct type based on the url
     * Performs basic authority validation - checks to see if the authority is of a valid type (i.e. aad, b2c, adfs)
     * 
     * Also performs endpoint discovery.
     * 
     * @param authorityUri
     * @param networkClient
     */
    static async createDiscoveredInstance(authorityUri: string, networkClient: INetworkModule): Promise<Authority> {
        // Initialize authority and perform discovery endpoint check.
        const acquireTokenAuthority: Authority = AuthorityFactory.createInstance(authorityUri, networkClient);

        if (acquireTokenAuthority.discoveryComplete()) {
            return acquireTokenAuthority;
        }

        try {
            await acquireTokenAuthority.resolveEndpointsAsync();
            return acquireTokenAuthority;
        } catch (e) {
            throw ClientAuthError.createEndpointDiscoveryIncompleteError(e);
        }
    }

    /**
     * Create an authority object of the correct type based on the url
     * Performs basic authority validation - checks to see if the authority is of a valid type (i.e. aad, b2c, adfs)
     * 
     * Does not perform endpoint discovery.
     * 
     * @param authorityUrl 
     * @param networkInterface 
     */
    static createInstance(authorityUrl: string, networkInterface: INetworkModule): Authority {
        // Throw error if authority url is empty
        if (StringUtils.isEmpty(authorityUrl)) {
            throw ClientConfigurationError.createUrlEmptyError();
        }

        return new Authority(authorityUrl, networkInterface);
    }
}
