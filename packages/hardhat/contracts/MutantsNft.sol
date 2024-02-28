// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MutantsNft is ERC721URIStorage {
	event NftMinted(
		address indexed minter,
		uint256 indexed tokenId,
		string tokenUri
	);

	uint256 private tokenCounter;
	uint256 private supply = 25;

	constructor() ERC721("Mutant", "MUT") {
		tokenCounter = 1;
	}

	function mintNft() public {
		require(tokenCounter < supply + 1, "SoldOut");
		uint256 newItemId = tokenCounter;
		tokenCounter = tokenCounter + 1;
		_safeMint(msg.sender, newItemId);
		// _setTokenUri(newItemId, string.concat(TOKEN_URI_PREFIX, Strings.toString(newItemId), '.json'));
		_setTokenURI(
			newItemId,
			string.concat(Strings.toString(newItemId), ".json")
		);
		emit NftMinted(
			msg.sender,
			newItemId,
			string.concat(_baseURI(), Strings.toString(newItemId), ".json")
		);
	}

	function _baseURI() internal pure override returns (string memory) {
		return
			"https://scarlet-far-urial-455.mypinata.cloud/ipfs/QmdTwTjtYxFHHio8NuP6nZPBfqZ1UvB46jMseyhUniPiEe/";
	}

	function getTokenCounter() public view returns (uint256) {
		return tokenCounter;
	}

	function getSupply() public view returns (uint256) {
		return supply;
	}

	function getTokenOwners(
		uint256[] memory tokenIds
	) public view returns (address[] memory) {
		address[] memory tokensToOwners = new address[](tokenIds.length);
		for (uint i = 0; i < tokenIds.length; i++) {
			tokensToOwners[i] = ERC721._ownerOf(tokenIds[i]);
		}
		return tokensToOwners;
	}
}
