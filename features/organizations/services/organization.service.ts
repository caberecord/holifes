import { db } from '@/lib/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    writeBatch
} from 'firebase/firestore';
import { Organization, OrganizationSchema, CreateOrganizationInput } from '../types/organization.schema';
import { OrganizationMember, OrganizationMemberSchema } from '../types/member.schema';

const ORG_COLLECTION = 'organizations';
const MEMBER_COLLECTION = 'organization_members';

/**
 * Get an organization by its ID
 */
export const getOrganizationById = async (id: string): Promise<Organization | null> => {
    const docRef = doc(db, ORG_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    // Validate data against schema
    const data = { id: docSnap.id, ...docSnap.data() };
    const parsed = OrganizationSchema.safeParse(data);

    if (!parsed.success) {
        console.error("Invalid organization data:", parsed.error);
        return null;
    }

    return parsed.data;
};

/**
 * Get an organization by its Slug
 */
export const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
    const q = query(collection(db, ORG_COLLECTION), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const docSnap = querySnapshot.docs[0];
    const data = { id: docSnap.id, ...docSnap.data() };

    // We trust the schema validation here or handle it similarly to getById
    return data as Organization;
};

/**
 * Create a new Organization
 */
export const createOrganization = async (
    input: CreateOrganizationInput,
    ownerId: string
): Promise<Organization> => {
    const batch = writeBatch(db);
    const newOrgRef = doc(collection(db, ORG_COLLECTION));
    const now = new Date();

    const newOrg: Organization = {
        id: newOrgRef.id,
        name: input.name,
        slug: input.slug,
        ownerId,
        ssoEnabled: false,
        domainVerified: false,
        createdAt: now,
        updatedAt: now,
    };

    // 1. Create Organization
    batch.set(newOrgRef, newOrg);

    // 2. Create Owner Member
    const memberId = `${newOrg.id}_${ownerId}`;
    const memberRef = doc(db, MEMBER_COLLECTION, memberId);

    const newMember: OrganizationMember = {
        id: memberId,
        organizationId: newOrg.id,
        userId: ownerId,
        role: 'owner',
        joinedAt: now,
        status: 'active'
    };

    batch.set(memberRef, newMember);

    await batch.commit();

    return newOrg;
};

/**
 * Get all organizations for a specific user
 */
export const getUserOrganizations = async (userId: string): Promise<Organization[]> => {
    // 1. Find all memberships for this user
    const q = query(collection(db, MEMBER_COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    const orgIds = snapshot.docs.map(d => d.data().organizationId);

    // 2. Fetch organizations (Firestore doesn't support "IN" with > 10 items easily, 
    // but for MVP/SMB this loop or Promise.all is fine)
    const orgs: Organization[] = [];

    for (const orgId of orgIds) {
        const org = await getOrganizationById(orgId);
        if (org) orgs.push(org);
    }

    return orgs;
};

/**
 * Get all members of an organization
 */
export const getOrganizationMembers = async (orgId: string): Promise<OrganizationMember[]> => {
    const q = query(collection(db, MEMBER_COLLECTION), where("organizationId", "==", orgId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    return snapshot.docs.map(d => d.data() as OrganizationMember);
};

/**
 * Invite a user to an organization
 * Note: This is a simplified version. In production, this should trigger an email via Cloud Functions.
 */
export const inviteMember = async (
    orgId: string,
    email: string,
    role: OrganizationMember['role'],
    invitedBy: string
): Promise<void> => {
    // 1. Check if user exists (optional for MVP, but good practice)
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const userSnap = await getDocs(q);

    let userId = '';

    if (!userSnap.empty) {
        userId = userSnap.docs[0].id;
    } else {
        // If user doesn't exist, we might create a placeholder or handle it in the UI.
        // For MVP, we'll assume we can only invite existing users or we generate a placeholder ID.
        // A better approach for non-existing users is to store an "invitation" document instead of a member document.
        // But to keep it simple as requested:
        userId = `invited_${email.replace(/[^a-zA-Z0-9]/g, '')}`;
    }

    const memberId = `${orgId}_${userId}`;
    const memberRef = doc(db, MEMBER_COLLECTION, memberId);

    const newMember: OrganizationMember = {
        id: memberId,
        organizationId: orgId,
        userId: userId,
        role,
        joinedAt: new Date(),
        invitedBy,
        status: userSnap.empty ? 'invited' : 'active' // If user exists, they are active immediately (simplified)
    };

    await setDoc(memberRef, newMember);
};

/**
 * Remove a member from an organization
 */
export const removeMember = async (orgId: string, memberId: string): Promise<void> => {
    // Ensure the ID matches the composite key pattern to avoid deleting wrong docs
    if (!memberId.startsWith(orgId)) {
        throw new Error("Invalid member ID for this organization");
    }
    await deleteDoc(doc(db, MEMBER_COLLECTION, memberId));
};

/**
 * Update a member's role
 */
export const updateMemberRole = async (
    orgId: string,
    memberId: string,
    newRole: OrganizationMember['role']
): Promise<void> => {
    if (!memberId.startsWith(orgId)) {
        throw new Error("Invalid member ID for this organization");
    }
    const memberRef = doc(db, MEMBER_COLLECTION, memberId);
    await updateDoc(memberRef, { role: newRole });
};
