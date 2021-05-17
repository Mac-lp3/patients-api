import { createHash } from 'crypto';
import { strictEqual, notStrictEqual } from 'assert';
import { getID } from '../src/shared/hash';
import { PatientInput } from '../src/types/patient';

const fn0 = 'jane';
const ln0 = 'doe';
const dob0 = '2020-01-01';

const fn1 = 'michael';
const ln1 = 'calvo';
const dob1 = '1986-12-04';

const fn2 = 'jan';
const ln2 = 'doe';
const dob2 = '2020-01-01';

const put1: PatientInput = {
    dob: dob1,
    firstName: fn1,
    lastName: ln1
}

const post1: PatientInput = {
    dob: dob1,
    firstName: fn1,
    lastName: ln1
}

describe('the hash function', function() {

    it('should be overloaded and generate the same value', function() {
        const putID = getID(put1);
        const postID = getID(post1);
        const stringsID = getID(fn1, ln1, dob1);

        strictEqual(putID, postID);
        strictEqual(putID, stringsID);
        strictEqual(postID, stringsID);
    })

    it('should return a hash of expected length', function() {
        const putID = getID(put1);

        strictEqual(putID.length, 7);
    })

    it('should generate unique hashes', function() {
        const id0 = getID(fn0, ln0, dob0);
        const id1 = getID(fn1, ln1, dob1);
        const id2 = getID(fn2, ln2, dob2);

        notStrictEqual(id0, id1);
        notStrictEqual(id0, id2);
        notStrictEqual(id1, id2);
    })

})