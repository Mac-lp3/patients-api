# Patients app


## ToC

* [1.0 Installation](##1.0-Installation)
* [2.0 Quick start](##2.0-Quick-start)
* [3.0 API documentation](##3.0-API-documentation)
    * [3.1 General query parameters](###3.1-General-query-parameters)
    * [3.2 GET patients collection (`/api/patients`)](###3.2-GET-patients-collection-(`/api/patients`))
    * [3.3 POST patients collection (`/api/patients`)](###3.3-POST-patients-collection-(`/api/patients`))
    * [3.4 GET patient instance (`/api/patients/{id}`)](###3.4-GET-patient-instance-(`/api/patients/{id}`))
    * [3.5 PATCH patient instance (`/api/patients/{id}`)](###3.5-PATCH-patient-instance-(`/api/patients/{id}`))
    * [3.6 PUT patient instance (`/api/patients/{id}`)](###3.6-PUT-patient-instance-(`/api/patients/{id}`))
    * [3.7 DELETE patient instance (`/api/patients/{id}`)](###3.7-DELETE-patient-instance-(`/api/patients/{id}`))
* [4.0 Project structure](##4.0-Project-structure)
* [5.0 Discussion topics](##5.0-Discussion-topics)

## 1.0 Installation

**1) Install NodeJS v16 or higher.**

It is _highly_ reccomended that you use [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm) for this.

Confirm your install with the following two commands:

```bash
node --version
npm --version
```

**2) Install TypeScript**

```bash
npm install -g typescript
```

Confirm your installation with

```bash
tsc --version
```

**3) Build it**

`cd` into the project root and run:

```bash
npm install                                              # installs external packages
tsc                                                      # compiles the typescript
cp src/conf/errorCodes.csv bin/src/conf/errorCodes.csv   # for windows, replace cp with copy
```
Confirm everything is working with:
```bash
npm run test
```

All tests should pass.

**4) Run it**

```bash
npm run start
```

## 2.0 Quick start

The app runs on `localhost:8080`. The API listens at `localhost:8080/api/patients`.

The following endpoints are supported. Full details can be found in the next section.

| Method   | Endpoint          | Description                                       |
|----------|-------------------|---------------------------------------------------|
| `GET`    | api/patients      | Returns all patients                              |
| `POST`   | api/patients      | Creates a new patient                             |
| `GET`    | api/patients/{id} | Returns patient with {id}                         |
| `PATCH`  | api/patients/{id} | Updates 1 or more fields of the patient with {id} |
| `PUT`    | api/patients/{id} | Full replace of the patient with {id}             |
| `DELETE` | api/patients/{id} | Deletes the patient with {id}                     |

**IMPORTANT**: Patient objects are uniquely identified by the value of their `firstName`, `lastName`, and `dob` fields. This means a change to one of those values via `PUT` or `PATCH` operation CAN CHANGE THEIR ID.

When making a `PUT` or `PATCH` always check the ID of the returned object, as it will be the latest version.

## 3.0 API documentation

All responses adhere to one of the following formats:

```json
// ResourceResponse
{
    "metadata": {
        "httpCode": string,
        "total": number          // if request was made against a collection
    },
    "payload": object | object[] // if request was made against a collection
}
```

```json
// ErrorResponse
{
    "metadata": {
        "httpCode": string
    },
    "paylerroroad": {
        "summary": string,
        "details": string,
        "resources": string[]
    }
}
```

### 3.1 General query parameters

The API currently only contains one resource (Patients). 

The following query parameters are supported by the `GET patients/` endpoint, but would also be supported by other `GET collection/` endpoints.

Note that each resource supports resource-specific query parameters in addition to the general ones listed here.

| Name     | Type   | Description                                       |
|----------|--------|---------------------------------------------------|
| `limit`  | number | Total number of records to return. |
| `offset` | number | The index at which to begin counting. Combine with `limit` for pagination. |
| `query`  | string | A general search term. Can be combined with other query parameters.  |

**NOTE**: At time of writing, only query is supported ):

### **3.2 GET patients collection (`/api/patients`)**

**Examples**

Returns all patients

```bash
curl localhost:8080/api/patients
```

Returns active patents with the last name "Doe":
```bash
curl localhost:8080/api/patients?lastName=doe&isActive=true
```

**Query parameters**

| Name        | Type    | Notes                            |
|-------------|---------|----------------------------------|
| `firstName` | string  | Case insensitive                 |
| `lastName`  | string  | Case insensitive                 |
| `dob`       | string  | Of format `YYYY-MM-DD`           |
| `isActive`  | boolean | `true` or `false`                |
| `telecom`   | string  | A telepone number (just numbers) |

**Retruns**

An array of patient objects that match the provided query terms (if any).

If there is a single match, then the array will contain only one element.

If there are no matches, the array will be empty.

```json
{
    "metadata": {
        "httpCode": string,
        "count": number
    },
    "payload": [{
        "id": string,
        "firstName": string,
        "lastName": string,
        "dob": string,
        "telecom"?: string,
        "isActive"?: boolean,
        "created": string
    }, ... ]
}
```

### **3.3 POST patients collection (`/api/patients`)**

Creates a new instance of `patient` in the collection.

Since patients are identified by firstName, lastName, and dob tripplet, the combination of these three values must be unique within the collection.

**Request body**

The following key/value pairs can be sent in the `POST` request body:

```json
{
    "firstName": string,  // required
    "lastName": string,   // required
    "dob": string,        // required
    "isActive": boolean,  // optional
    "telecom": string     // optional
}
```

**Returns**

If successful, this will return a fully populated patient object with a generated ID. This ID can be used to directly reference the patient in the system:

```json
    metadata: {
        "httpCode": string,
        "count": number
    },
    "payload": {
        "id": string,
        "firstName": string,
        "lastName": string,
        "dob": string,
        "telecom"?: string,
        "isActive"?: boolean,
        "created": string
    }
```

### **3.4 GET patient instance (`/api/patients/{id}`)**

**Returns**

The patient with this ID, or a 404 if not found.

```json
    metadata: {
        "httpCode": string,
        "count": number
    },
    "payload": {
        "id": string,
        "firstName": string,
        "lastName": string,
        "dob": string,
        "telecom"?: string,
        "isActive"?: boolean,
        "created": string
    }
```

### **3.5 PATCH patient instance (`/api/patients/{id}`)**

This method is used to update 1 or more values on the patient object.

Users can send a payload that only includes 1 of the fields listed below.

**IMPORTANT**: If the PATCH includes an update to the `firstName`, `lastName`, or `dob` fields, then a new ID will be generated and assigned to this patient.

Check the returned object for the new ID if you change one of these values.

**Request body**

One or more of the following key/value pairs can be sent in the request body:

```json
{
    "firstName": string,  // optional
    "lastName": string,   // optional
    "dob": string,        // optional
    "isActive": boolean,  // optional
    "telecom": string     // optional
}
```

**Returns**

The latest version of the patient.

```json
    metadata: {
        "httpCode": string,
        "count": number
    },
    "payload": {
        "id": string,
        "firstName": string,
        "lastName": string,
        "dob": string,
        "telecom"?: string,
        "isActive"?: boolean,
        "created": string
    }
```

### **3.6 PUT patient instance (`/api/patients/{id}`)**

This method is used to completely replace a patient with a new one. 

Unlike patch, you must include all required fields, even if they are the same value as the existing version of the patient.

**Request body**

The following key/value pairs can be sent in the request body:

```json
{
    "firstName": string,  // required
    "lastName": string,   // required
    "dob": string,        // required
    "isActive": boolean,  // optional
    "telecom": string     // optional
}
```

**Returns**

The latest version of the patient.

```json
    metadata: {
        "httpCode": string,
        "count": number
    },
    "payload": {
        "id": string,
        "firstName": string,
        "lastName": string,
        "dob": string,
        "telecom"?: string,
        "isActive"?: boolean,
        "created": string
    }
```

### **3.7 DELETE patient instance (`/api/patients/{id}`)**

This operation will delete the patient with the given ID from the collection.

**Returns**

An empty payload.

```json
    metadata: {
        "httpCode": string
    },
    "payload": {}
```

## 4.0 Project structure

```
project-root/
  |- bin/                   # TypeScript is compiled to this directory
  |- src/
  |  |- server.ts           <- start here
  |  |- conf/               # contains data files
  |  |- endpoints/
  |  |  `- patients/        # additional resources would get their own folder
  |  |     |- handlers.ts   <- here 2nd
  |  |     `- validator.ts 
  |  |- shared/             # utilities used by all resources
  |  |  `- dao.ts           <- here 3rd
  |  `- types/
  |- test/                  # contains unit tests
  |- package.json           # build/tests scripts can be found in here
  `- tsconfig.json          # typescript compiler config
```

## 5.0 Discussion topics

* id pattern: md5/hex first 7
* downside of updating IDs
* Idempotency & IDs
* search function behavior
* use of csv and json (.ts) for some data
* didnt implement limit/offset
* swagger / protocol buffers
* hypothetical deployment
