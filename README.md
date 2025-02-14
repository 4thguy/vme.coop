# VmeCoop - Comprehensive README

## Overview

**VmeCoop** is a full-stack e-commerce platform that consists of three separate projects:

1. `BackendVmeCoop` - A PHP-based backend API for managing products, orders, and authentication.
2. `StripeVmeCoop` - A dedicated Stripe integration service for handling payments.
3. `FrontendVmeCoop` - An Angular-based front-end for user interactions.

Each of these projects operates independently but integrates seamlessly to provide a functional e-commerce experience.

More details about each section is available in `README.md` in the respective folders.

## Dependencies used

- `Docker` - Use `docker compose up` to bring the project up. It will take care of pulling the images and setting things up. 


## Summary
| Component           | Technology | Responsibilities |
|---------------------|------------|----------------|
| **BackendVmeCoop** | PHP, MySQL | Handles RESTful API requests, product and order management. |
| **StripeVmeCoop** | PHP, Stripe API | Manages payments, integrates with Stripe, updates order statuses. |
| **FrontendVmeCoop** | Angular, TypeScript | Provides the user interface for shopping, cart, and orders. |

