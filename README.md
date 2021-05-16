# TODO

* ~~hasher investigations & pattern~~
* ~~generate some test patients~~
* ~~implement & test dao methods~~
* ~~pattern for error/code mapping~~
* ~~pattern for metadata~~
* add endpoints 
    + Promise.all() and assemble
* request validation pattern
* response handling pattern
* error handling pattern
* limit/offset to query function
* request/response builder?
* error handler impl

* creation/constructor/builder methods for patient objects?

# Optimizations

* async search function

# Notes for them

* installation notes
* use of patch vs put
* id pattern: md5/hex first 7
* downside of updating IDs (is that a problem given the spec tho?)
* search func behavior
* use of length & async plan
* hypothetical deployment 

# QQs

* *nix or windows?
* id ok?

# Endpoints, Methods, & Parameters

## General `GET` query parameters

The following query parameters are used by multiple endpoints/resources. 

The individual endpoint documentation will specify if they are supported.

| Name   | Type   | Description             |
|--------|--------|-------------------------|
| `limit`  | number | Total number of records to return. Default is 15. |
| `offset` | number | Index at which to start the query. Combine with `limit` for pagination. |
| `query`  | string | A general search term. Can be combined with resource specific parameters to further refine results.  |

A note on query logic:

The application will match records by "flattening" the values of each string property value and then look for an exact match of the term in the combined string.

For example, given the term `foobar` and the following object:
```
{
    name: "fido",
    isGoodBoy: true,
    owner: "foo",
    bestFriend: "bar"
}
```

The object will be flattened to the following string:
```
fidofoobar
```
Since this string contains `foobar`, it will be returned in the result set.

# Patients collection (`domain.com/api/patients`)

Methods: 
* GET
* POST

## GET

**Examples**

Returns the 15 most recently added patients:
```
domain.com/api/patients
```

Returns the 30 most recently added patients:
```
domain.com/api/patients?limit=30
```

Returns the 15 most recent active patents with the last name "Doe":
```
domain.com/api/patients?lastName=doe&isActive=true
```

**Query parameters**

All general `GET` parameters are supported.

The following resource-specific parameters are also supported:

| Name        | Type    | Notes                   |
|-------------|---------|-------------------------|
| `firstName` | string  | Case insensitive        |
| `lastName`  | string  | Case insensitive        |
| `dob`       | string  | Of format `YYYY-MM-DD`  |
| `isActive`  | boolean | `true` or `false`       |
| `zip`       | string  |                         |

**Retruns**

An array of patient objects that match the provided query terms (if any).

If there is a single match, then the array will contain only one element.

If there are no matches, the array will be empty.

```
[{
    id: string,
    firstName: string,
    lastName: string,
    dob: string,
    telcom: string,
    isActive: boolean,
    zip: string,
    created: string
}, ... ]
```

## POST

Creates a new instance of `patient` in the collection.

Since patients are identified by firstName, lastName, and dob tripplet, the combination of these three values must be unique within the collection.

**Request body**

The following key/value pairs can be sent in the `POST` request body:

```
{
    firstName: string, // required
    lastName: string,  // required
    dob: string,       // required
    isActive: boolean  // required
    telcom: string     // optional
}
```

**Returns**

If successful, this will return a fully populated patient object with a generated ID. This ID can be used to directly reference the patient in the system:

```
{
    id: string,
    firstName: string,
    lastName: string,
    dob: string,
    telcom: string,
    isActive: boolean,
    zip: string,
    created: string
}
```