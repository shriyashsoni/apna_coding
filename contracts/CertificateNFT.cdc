// SPDX-License-Identifier: MIT
// Apna Coding Certificate NFT Contract
// Flow Blockchain

import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448

pub contract ApnaCodingCertificate: NonFungibleToken {

    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event CertificateMinted(id: UInt64, recipient: Address, eventId: String, eventType: String)

    // Paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath

    // Total supply
    pub var totalSupply: UInt64

    // Certificate metadata
    pub struct CertificateMetadata {
        pub let certificateId: UInt64
        pub let recipientName: String
        pub let recipientWallet: Address
        pub let eventId: String
        pub let eventName: String
        pub let eventType: String // "hackathon", "course", "internship", "event"
        pub let issuedDate: UFix64
        pub let issuer: String // "Apna Coding"
        pub let skills: [String]
        pub let achievementLevel: String // "participant", "winner", "completion"
        pub let verificationHash: String

        init(
            certificateId: UInt64,
            recipientName: String,
            recipientWallet: Address,
            eventId: String,
            eventName: String,
            eventType: String,
            issuedDate: UFix64,
            issuer: String,
            skills: [String],
            achievementLevel: String,
            verificationHash: String
        ) {
            self.certificateId = certificateId
            self.recipientName = recipientName
            self.recipientWallet = recipientWallet
            self.eventId = eventId
            self.eventName = eventName
            self.eventType = eventType
            self.issuedDate = issuedDate
            self.issuer = issuer
            self.skills = skills
            self.achievementLevel = achievementLevel
            self.verificationHash = verificationHash
        }
    }

    // NFT Resource
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let metadata: CertificateMetadata

        init(
            id: UInt64,
            metadata: CertificateMetadata
        ) {
            self.id = id
            self.metadata = metadata
        }

        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<CertificateMetadata>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.metadata.eventName.concat(" Certificate"),
                        description: "Apna Coding - ".concat(self.metadata.eventType).concat(" certificate for ").concat(self.metadata.recipientName),
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://apnacoding.site/certificate/".concat(self.id.toString())
                        )
                    )
                case Type<CertificateMetadata>():
                    return self.metadata
            }
            return nil
        }
    }

    // Collection Interface
    pub resource interface ApnaCodingCertificateCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowCertificate(id: UInt64): &ApnaCodingCertificate.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow certificate reference: The ID of the returned reference is incorrect"
            }
        }
    }

    // Collection Resource
    pub resource Collection: ApnaCodingCertificateCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @ApnaCodingCertificate.NFT
            let id: UInt64 = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        pub fun borrowCertificate(id: UInt64): &ApnaCodingCertificate.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &ApnaCodingCertificate.NFT
            }
            return nil
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let certificate = nft as! &ApnaCodingCertificate.NFT
            return certificate as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // Public function to create empty collection
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    // Minter Resource (Admin only)
    pub resource NFTMinter {
        pub fun mintNFT(
            recipient: &{NonFungibleToken.CollectionPublic},
            recipientName: String,
            recipientWallet: Address,
            eventId: String,
            eventName: String,
            eventType: String,
            skills: [String],
            achievementLevel: String,
            verificationHash: String
        ): UInt64 {
            let metadata = CertificateMetadata(
                certificateId: ApnaCodingCertificate.totalSupply,
                recipientName: recipientName,
                recipientWallet: recipientWallet,
                eventId: eventId,
                eventName: eventName,
                eventType: eventType,
                issuedDate: getCurrentBlock().timestamp,
                issuer: "Apna Coding",
                skills: skills,
                achievementLevel: achievementLevel,
                verificationHash: verificationHash
            )

            var newNFT <- create NFT(
                id: ApnaCodingCertificate.totalSupply,
                metadata: metadata
            )

            let certificateId = newNFT.id

            recipient.deposit(token: <-newNFT)

            ApnaCodingCertificate.totalSupply = ApnaCodingCertificate.totalSupply + 1

            emit CertificateMinted(
                id: certificateId,
                recipient: recipientWallet,
                eventId: eventId,
                eventType: eventType
            )

            return certificateId
        }
    }

    // Contract initialization
    init() {
        self.CollectionStoragePath = /storage/ApnaCodingCertificateCollection
        self.CollectionPublicPath = /public/ApnaCodingCertificateCollection
        self.MinterStoragePath = /storage/ApnaCodingCertificateMinter

        self.totalSupply = 0

        // Create minter and save to storage
        let minter <- create NFTMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)

        emit ContractInitialized()
    }
}
