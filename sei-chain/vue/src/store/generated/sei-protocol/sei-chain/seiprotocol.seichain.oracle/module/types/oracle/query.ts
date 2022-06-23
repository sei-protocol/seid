/* eslint-disable */
import { Reader, util, configure, Writer } from "protobufjs/minimal";
import * as Long from "long";
import {
  OracleExchangeRate,
  PriceSnapshot,
  OracleTwap,
  VotePenaltyCounter,
  AggregateExchangeRatePrevote,
  AggregateExchangeRateVote,
  Params,
} from "../oracle/oracle";

export const protobufPackage = "seiprotocol.seichain.oracle";

/** QueryExchangeRateRequest is the request type for the Query/ExchangeRate RPC method. */
export interface QueryExchangeRateRequest {
  /** denom defines the denomination to query for. */
  denom: string;
}

/**
 * QueryExchangeRateResponse is response type for the
 * Query/ExchangeRate RPC method.
 */
export interface QueryExchangeRateResponse {
  /** exchange_rate defines the exchange rate of Luna denominated in various Terra */
  oracleExchangeRate: OracleExchangeRate | undefined;
}

/** QueryExchangeRatesRequest is the request type for the Query/ExchangeRates RPC method. */
export interface QueryExchangeRatesRequest {}

export interface DenomOracleExchangeRatePair {
  denom: string;
  oracleExchangeRate: OracleExchangeRate | undefined;
}

/**
 * QueryExchangeRatesResponse is response type for the
 * Query/ExchangeRates RPC method.
 */
export interface QueryExchangeRatesResponse {
  /** exchange_rates defines a list of the exchange rate for all whitelisted denoms. */
  denomOracleExchangeRatePairs: DenomOracleExchangeRatePair[];
}

/** QueryActivesRequest is the request type for the Query/Actives RPC method. */
export interface QueryActivesRequest {}

/**
 * QueryActivesResponse is response type for the
 * Query/Actives RPC method.
 */
export interface QueryActivesResponse {
  /** actives defines a list of the denomination which oracle prices aggreed upon. */
  actives: string[];
}

/** QueryVoteTargetsRequest is the request type for the Query/VoteTargets RPC method. */
export interface QueryVoteTargetsRequest {}

/**
 * QueryVoteTargetsResponse is response type for the
 * Query/VoteTargets RPC method.
 */
export interface QueryVoteTargetsResponse {
  /**
   * vote_targets defines a list of the denomination in which everyone
   * should vote in the current vote period.
   */
  voteTargets: string[];
}

/** request type for price snapshot history RPC method */
export interface QueryPriceSnapshotHistoryRequest {}

export interface QueryPriceSnapshotHistoryResponse {
  priceSnapshots: PriceSnapshot[];
}

/** request type for twap RPC method */
export interface QueryTwapsRequest {
  lookbackSeconds: number;
}

export interface QueryTwapsResponse {
  oracleTwaps: OracleTwap[];
}

/** QueryFeederDelegationRequest is the request type for the Query/FeederDelegation RPC method. */
export interface QueryFeederDelegationRequest {
  /** validator defines the validator address to query for. */
  validatorAddr: string;
}

/**
 * QueryFeederDelegationResponse is response type for the
 * Query/FeederDelegation RPC method.
 */
export interface QueryFeederDelegationResponse {
  /** feeder_addr defines the feeder delegation of a validator */
  feederAddr: string;
}

/** QueryVotePenaltyCounterRequest is the request type for the Query/MissCounter RPC method. */
export interface QueryVotePenaltyCounterRequest {
  /** validator defines the validator address to query for. */
  validatorAddr: string;
}

/**
 * QueryVotePenaltyCounterResponse is response type for the
 * Query/VotePenaltyCounter RPC method.
 */
export interface QueryVotePenaltyCounterResponse {
  votePenaltyCounter: VotePenaltyCounter | undefined;
}

/** QueryAggregatePrevoteRequest is the request type for the Query/AggregatePrevote RPC method. */
export interface QueryAggregatePrevoteRequest {
  /** validator defines the validator address to query for. */
  validatorAddr: string;
}

/**
 * QueryAggregatePrevoteResponse is response type for the
 * Query/AggregatePrevote RPC method.
 */
export interface QueryAggregatePrevoteResponse {
  /** aggregate_prevote defines oracle aggregate prevote submitted by a validator in the current vote period */
  aggregatePrevote: AggregateExchangeRatePrevote | undefined;
}

/** QueryAggregatePrevotesRequest is the request type for the Query/AggregatePrevotes RPC method. */
export interface QueryAggregatePrevotesRequest {}

/**
 * QueryAggregatePrevotesResponse is response type for the
 * Query/AggregatePrevotes RPC method.
 */
export interface QueryAggregatePrevotesResponse {
  /** aggregate_prevotes defines all oracle aggregate prevotes submitted in the current vote period */
  aggregatePrevotes: AggregateExchangeRatePrevote[];
}

/** QueryAggregateVoteRequest is the request type for the Query/AggregateVote RPC method. */
export interface QueryAggregateVoteRequest {
  /** validator defines the validator address to query for. */
  validatorAddr: string;
}

/**
 * QueryAggregateVoteResponse is response type for the
 * Query/AggregateVote RPC method.
 */
export interface QueryAggregateVoteResponse {
  /** aggregate_vote defines oracle aggregate vote submitted by a validator in the current vote period */
  aggregateVote: AggregateExchangeRateVote | undefined;
}

/** QueryAggregateVotesRequest is the request type for the Query/AggregateVotes RPC method. */
export interface QueryAggregateVotesRequest {}

/**
 * QueryAggregateVotesResponse is response type for the
 * Query/AggregateVotes RPC method.
 */
export interface QueryAggregateVotesResponse {
  /** aggregate_votes defines all oracle aggregate votes submitted in the current vote period */
  aggregateVotes: AggregateExchangeRateVote[];
}

/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}

/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params defines the parameters of the module. */
  params: Params | undefined;
}

const baseQueryExchangeRateRequest: object = { denom: "" };

export const QueryExchangeRateRequest = {
  encode(
    message: QueryExchangeRateRequest,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryExchangeRateRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryExchangeRateRequest,
    } as QueryExchangeRateRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryExchangeRateRequest {
    const message = {
      ...baseQueryExchangeRateRequest,
    } as QueryExchangeRateRequest;
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = String(object.denom);
    } else {
      message.denom = "";
    }
    return message;
  },

  toJSON(message: QueryExchangeRateRequest): unknown {
    const obj: any = {};
    message.denom !== undefined && (obj.denom = message.denom);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryExchangeRateRequest>
  ): QueryExchangeRateRequest {
    const message = {
      ...baseQueryExchangeRateRequest,
    } as QueryExchangeRateRequest;
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    } else {
      message.denom = "";
    }
    return message;
  },
};

const baseQueryExchangeRateResponse: object = {};

export const QueryExchangeRateResponse = {
  encode(
    message: QueryExchangeRateResponse,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.oracleExchangeRate !== undefined) {
      OracleExchangeRate.encode(
        message.oracleExchangeRate,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryExchangeRateResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryExchangeRateResponse,
    } as QueryExchangeRateResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.oracleExchangeRate = OracleExchangeRate.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryExchangeRateResponse {
    const message = {
      ...baseQueryExchangeRateResponse,
    } as QueryExchangeRateResponse;
    if (
      object.oracleExchangeRate !== undefined &&
      object.oracleExchangeRate !== null
    ) {
      message.oracleExchangeRate = OracleExchangeRate.fromJSON(
        object.oracleExchangeRate
      );
    } else {
      message.oracleExchangeRate = undefined;
    }
    return message;
  },

  toJSON(message: QueryExchangeRateResponse): unknown {
    const obj: any = {};
    message.oracleExchangeRate !== undefined &&
      (obj.oracleExchangeRate = message.oracleExchangeRate
        ? OracleExchangeRate.toJSON(message.oracleExchangeRate)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryExchangeRateResponse>
  ): QueryExchangeRateResponse {
    const message = {
      ...baseQueryExchangeRateResponse,
    } as QueryExchangeRateResponse;
    if (
      object.oracleExchangeRate !== undefined &&
      object.oracleExchangeRate !== null
    ) {
      message.oracleExchangeRate = OracleExchangeRate.fromPartial(
        object.oracleExchangeRate
      );
    } else {
      message.oracleExchangeRate = undefined;
    }
    return message;
  },
};

const baseQueryExchangeRatesRequest: object = {};

export const QueryExchangeRatesRequest = {
  encode(
    _: QueryExchangeRatesRequest,
    writer: Writer = Writer.create()
  ): Writer {
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryExchangeRatesRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryExchangeRatesRequest,
    } as QueryExchangeRatesRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): QueryExchangeRatesRequest {
    const message = {
      ...baseQueryExchangeRatesRequest,
    } as QueryExchangeRatesRequest;
    return message;
  },

  toJSON(_: QueryExchangeRatesRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<QueryExchangeRatesRequest>
  ): QueryExchangeRatesRequest {
    const message = {
      ...baseQueryExchangeRatesRequest,
    } as QueryExchangeRatesRequest;
    return message;
  },
};

const baseDenomOracleExchangeRatePair: object = { denom: "" };

export const DenomOracleExchangeRatePair = {
  encode(
    message: DenomOracleExchangeRatePair,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.oracleExchangeRate !== undefined) {
      OracleExchangeRate.encode(
        message.oracleExchangeRate,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): DenomOracleExchangeRatePair {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDenomOracleExchangeRatePair,
    } as DenomOracleExchangeRatePair;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        case 2:
          message.oracleExchangeRate = OracleExchangeRate.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DenomOracleExchangeRatePair {
    const message = {
      ...baseDenomOracleExchangeRatePair,
    } as DenomOracleExchangeRatePair;
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = String(object.denom);
    } else {
      message.denom = "";
    }
    if (
      object.oracleExchangeRate !== undefined &&
      object.oracleExchangeRate !== null
    ) {
      message.oracleExchangeRate = OracleExchangeRate.fromJSON(
        object.oracleExchangeRate
      );
    } else {
      message.oracleExchangeRate = undefined;
    }
    return message;
  },

  toJSON(message: DenomOracleExchangeRatePair): unknown {
    const obj: any = {};
    message.denom !== undefined && (obj.denom = message.denom);
    message.oracleExchangeRate !== undefined &&
      (obj.oracleExchangeRate = message.oracleExchangeRate
        ? OracleExchangeRate.toJSON(message.oracleExchangeRate)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<DenomOracleExchangeRatePair>
  ): DenomOracleExchangeRatePair {
    const message = {
      ...baseDenomOracleExchangeRatePair,
    } as DenomOracleExchangeRatePair;
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    } else {
      message.denom = "";
    }
    if (
      object.oracleExchangeRate !== undefined &&
      object.oracleExchangeRate !== null
    ) {
      message.oracleExchangeRate = OracleExchangeRate.fromPartial(
        object.oracleExchangeRate
      );
    } else {
      message.oracleExchangeRate = undefined;
    }
    return message;
  },
};

const baseQueryExchangeRatesResponse: object = {};

export const QueryExchangeRatesResponse = {
  encode(
    message: QueryExchangeRatesResponse,
    writer: Writer = Writer.create()
  ): Writer {
    for (const v of message.denomOracleExchangeRatePairs) {
      DenomOracleExchangeRatePair.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryExchangeRatesResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryExchangeRatesResponse,
    } as QueryExchangeRatesResponse;
    message.denomOracleExchangeRatePairs = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denomOracleExchangeRatePairs.push(
            DenomOracleExchangeRatePair.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryExchangeRatesResponse {
    const message = {
      ...baseQueryExchangeRatesResponse,
    } as QueryExchangeRatesResponse;
    message.denomOracleExchangeRatePairs = [];
    if (
      object.denomOracleExchangeRatePairs !== undefined &&
      object.denomOracleExchangeRatePairs !== null
    ) {
      for (const e of object.denomOracleExchangeRatePairs) {
        message.denomOracleExchangeRatePairs.push(
          DenomOracleExchangeRatePair.fromJSON(e)
        );
      }
    }
    return message;
  },

  toJSON(message: QueryExchangeRatesResponse): unknown {
    const obj: any = {};
    if (message.denomOracleExchangeRatePairs) {
      obj.denomOracleExchangeRatePairs = message.denomOracleExchangeRatePairs.map(
        (e) => (e ? DenomOracleExchangeRatePair.toJSON(e) : undefined)
      );
    } else {
      obj.denomOracleExchangeRatePairs = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryExchangeRatesResponse>
  ): QueryExchangeRatesResponse {
    const message = {
      ...baseQueryExchangeRatesResponse,
    } as QueryExchangeRatesResponse;
    message.denomOracleExchangeRatePairs = [];
    if (
      object.denomOracleExchangeRatePairs !== undefined &&
      object.denomOracleExchangeRatePairs !== null
    ) {
      for (const e of object.denomOracleExchangeRatePairs) {
        message.denomOracleExchangeRatePairs.push(
          DenomOracleExchangeRatePair.fromPartial(e)
        );
      }
    }
    return message;
  },
};

const baseQueryActivesRequest: object = {};

export const QueryActivesRequest = {
  encode(_: QueryActivesRequest, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryActivesRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryActivesRequest } as QueryActivesRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): QueryActivesRequest {
    const message = { ...baseQueryActivesRequest } as QueryActivesRequest;
    return message;
  },

  toJSON(_: QueryActivesRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<QueryActivesRequest>): QueryActivesRequest {
    const message = { ...baseQueryActivesRequest } as QueryActivesRequest;
    return message;
  },
};

const baseQueryActivesResponse: object = { actives: "" };

export const QueryActivesResponse = {
  encode(
    message: QueryActivesResponse,
    writer: Writer = Writer.create()
  ): Writer {
    for (const v of message.actives) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryActivesResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryActivesResponse } as QueryActivesResponse;
    message.actives = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.actives.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryActivesResponse {
    const message = { ...baseQueryActivesResponse } as QueryActivesResponse;
    message.actives = [];
    if (object.actives !== undefined && object.actives !== null) {
      for (const e of object.actives) {
        message.actives.push(String(e));
      }
    }
    return message;
  },

  toJSON(message: QueryActivesResponse): unknown {
    const obj: any = {};
    if (message.actives) {
      obj.actives = message.actives.map((e) => e);
    } else {
      obj.actives = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<QueryActivesResponse>): QueryActivesResponse {
    const message = { ...baseQueryActivesResponse } as QueryActivesResponse;
    message.actives = [];
    if (object.actives !== undefined && object.actives !== null) {
      for (const e of object.actives) {
        message.actives.push(e);
      }
    }
    return message;
  },
};

const baseQueryVoteTargetsRequest: object = {};

export const QueryVoteTargetsRequest = {
  encode(_: QueryVoteTargetsRequest, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryVoteTargetsRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryVoteTargetsRequest,
    } as QueryVoteTargetsRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): QueryVoteTargetsRequest {
    const message = {
      ...baseQueryVoteTargetsRequest,
    } as QueryVoteTargetsRequest;
    return message;
  },

  toJSON(_: QueryVoteTargetsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<QueryVoteTargetsRequest>
  ): QueryVoteTargetsRequest {
    const message = {
      ...baseQueryVoteTargetsRequest,
    } as QueryVoteTargetsRequest;
    return message;
  },
};

const baseQueryVoteTargetsResponse: object = { voteTargets: "" };

export const QueryVoteTargetsResponse = {
  encode(
    message: QueryVoteTargetsResponse,
    writer: Writer = Writer.create()
  ): Writer {
    for (const v of message.voteTargets) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryVoteTargetsResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryVoteTargetsResponse,
    } as QueryVoteTargetsResponse;
    message.voteTargets = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.voteTargets.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryVoteTargetsResponse {
    const message = {
      ...baseQueryVoteTargetsResponse,
    } as QueryVoteTargetsResponse;
    message.voteTargets = [];
    if (object.voteTargets !== undefined && object.voteTargets !== null) {
      for (const e of object.voteTargets) {
        message.voteTargets.push(String(e));
      }
    }
    return message;
  },

  toJSON(message: QueryVoteTargetsResponse): unknown {
    const obj: any = {};
    if (message.voteTargets) {
      obj.voteTargets = message.voteTargets.map((e) => e);
    } else {
      obj.voteTargets = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryVoteTargetsResponse>
  ): QueryVoteTargetsResponse {
    const message = {
      ...baseQueryVoteTargetsResponse,
    } as QueryVoteTargetsResponse;
    message.voteTargets = [];
    if (object.voteTargets !== undefined && object.voteTargets !== null) {
      for (const e of object.voteTargets) {
        message.voteTargets.push(e);
      }
    }
    return message;
  },
};

const baseQueryPriceSnapshotHistoryRequest: object = {};

export const QueryPriceSnapshotHistoryRequest = {
  encode(
    _: QueryPriceSnapshotHistoryRequest,
    writer: Writer = Writer.create()
  ): Writer {
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryPriceSnapshotHistoryRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryPriceSnapshotHistoryRequest,
    } as QueryPriceSnapshotHistoryRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): QueryPriceSnapshotHistoryRequest {
    const message = {
      ...baseQueryPriceSnapshotHistoryRequest,
    } as QueryPriceSnapshotHistoryRequest;
    return message;
  },

  toJSON(_: QueryPriceSnapshotHistoryRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<QueryPriceSnapshotHistoryRequest>
  ): QueryPriceSnapshotHistoryRequest {
    const message = {
      ...baseQueryPriceSnapshotHistoryRequest,
    } as QueryPriceSnapshotHistoryRequest;
    return message;
  },
};

const baseQueryPriceSnapshotHistoryResponse: object = {};

export const QueryPriceSnapshotHistoryResponse = {
  encode(
    message: QueryPriceSnapshotHistoryResponse,
    writer: Writer = Writer.create()
  ): Writer {
    for (const v of message.priceSnapshots) {
      PriceSnapshot.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryPriceSnapshotHistoryResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryPriceSnapshotHistoryResponse,
    } as QueryPriceSnapshotHistoryResponse;
    message.priceSnapshots = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.priceSnapshots.push(
            PriceSnapshot.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryPriceSnapshotHistoryResponse {
    const message = {
      ...baseQueryPriceSnapshotHistoryResponse,
    } as QueryPriceSnapshotHistoryResponse;
    message.priceSnapshots = [];
    if (object.priceSnapshots !== undefined && object.priceSnapshots !== null) {
      for (const e of object.priceSnapshots) {
        message.priceSnapshots.push(PriceSnapshot.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: QueryPriceSnapshotHistoryResponse): unknown {
    const obj: any = {};
    if (message.priceSnapshots) {
      obj.priceSnapshots = message.priceSnapshots.map((e) =>
        e ? PriceSnapshot.toJSON(e) : undefined
      );
    } else {
      obj.priceSnapshots = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryPriceSnapshotHistoryResponse>
  ): QueryPriceSnapshotHistoryResponse {
    const message = {
      ...baseQueryPriceSnapshotHistoryResponse,
    } as QueryPriceSnapshotHistoryResponse;
    message.priceSnapshots = [];
    if (object.priceSnapshots !== undefined && object.priceSnapshots !== null) {
      for (const e of object.priceSnapshots) {
        message.priceSnapshots.push(PriceSnapshot.fromPartial(e));
      }
    }
    return message;
  },
};

const baseQueryTwapsRequest: object = { lookbackSeconds: 0 };

export const QueryTwapsRequest = {
  encode(message: QueryTwapsRequest, writer: Writer = Writer.create()): Writer {
    if (message.lookbackSeconds !== 0) {
      writer.uint32(8).int64(message.lookbackSeconds);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryTwapsRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryTwapsRequest } as QueryTwapsRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lookbackSeconds = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryTwapsRequest {
    const message = { ...baseQueryTwapsRequest } as QueryTwapsRequest;
    if (
      object.lookbackSeconds !== undefined &&
      object.lookbackSeconds !== null
    ) {
      message.lookbackSeconds = Number(object.lookbackSeconds);
    } else {
      message.lookbackSeconds = 0;
    }
    return message;
  },

  toJSON(message: QueryTwapsRequest): unknown {
    const obj: any = {};
    message.lookbackSeconds !== undefined &&
      (obj.lookbackSeconds = message.lookbackSeconds);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryTwapsRequest>): QueryTwapsRequest {
    const message = { ...baseQueryTwapsRequest } as QueryTwapsRequest;
    if (
      object.lookbackSeconds !== undefined &&
      object.lookbackSeconds !== null
    ) {
      message.lookbackSeconds = object.lookbackSeconds;
    } else {
      message.lookbackSeconds = 0;
    }
    return message;
  },
};

const baseQueryTwapsResponse: object = {};

export const QueryTwapsResponse = {
  encode(
    message: QueryTwapsResponse,
    writer: Writer = Writer.create()
  ): Writer {
    for (const v of message.oracleTwaps) {
      OracleTwap.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryTwapsResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryTwapsResponse } as QueryTwapsResponse;
    message.oracleTwaps = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.oracleTwaps.push(OracleTwap.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryTwapsResponse {
    const message = { ...baseQueryTwapsResponse } as QueryTwapsResponse;
    message.oracleTwaps = [];
    if (object.oracleTwaps !== undefined && object.oracleTwaps !== null) {
      for (const e of object.oracleTwaps) {
        message.oracleTwaps.push(OracleTwap.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: QueryTwapsResponse): unknown {
    const obj: any = {};
    if (message.oracleTwaps) {
      obj.oracleTwaps = message.oracleTwaps.map((e) =>
        e ? OracleTwap.toJSON(e) : undefined
      );
    } else {
      obj.oracleTwaps = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<QueryTwapsResponse>): QueryTwapsResponse {
    const message = { ...baseQueryTwapsResponse } as QueryTwapsResponse;
    message.oracleTwaps = [];
    if (object.oracleTwaps !== undefined && object.oracleTwaps !== null) {
      for (const e of object.oracleTwaps) {
        message.oracleTwaps.push(OracleTwap.fromPartial(e));
      }
    }
    return message;
  },
};

const baseQueryFeederDelegationRequest: object = { validatorAddr: "" };

export const QueryFeederDelegationRequest = {
  encode(
    message: QueryFeederDelegationRequest,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.validatorAddr !== "") {
      writer.uint32(10).string(message.validatorAddr);
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryFeederDelegationRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryFeederDelegationRequest,
    } as QueryFeederDelegationRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryFeederDelegationRequest {
    const message = {
      ...baseQueryFeederDelegationRequest,
    } as QueryFeederDelegationRequest;
    if (object.validatorAddr !== undefined && object.validatorAddr !== null) {
      message.validatorAddr = String(object.validatorAddr);
    } else {
      message.validatorAddr = "";
    }
    return message;
  },

  toJSON(message: QueryFeederDelegationRequest): unknown {
    const obj: any = {};
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryFeederDelegationRequest>
  ): QueryFeederDelegationRequest {
    const message = {
      ...baseQueryFeederDelegationRequest,
    } as QueryFeederDelegationRequest;
    if (object.validatorAddr !== undefined && object.validatorAddr !== null) {
      message.validatorAddr = object.validatorAddr;
    } else {
      message.validatorAddr = "";
    }
    return message;
  },
};

const baseQueryFeederDelegationResponse: object = { feederAddr: "" };

export const QueryFeederDelegationResponse = {
  encode(
    message: QueryFeederDelegationResponse,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.feederAddr !== "") {
      writer.uint32(10).string(message.feederAddr);
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryFeederDelegationResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryFeederDelegationResponse,
    } as QueryFeederDelegationResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.feederAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryFeederDelegationResponse {
    const message = {
      ...baseQueryFeederDelegationResponse,
    } as QueryFeederDelegationResponse;
    if (object.feederAddr !== undefined && object.feederAddr !== null) {
      message.feederAddr = String(object.feederAddr);
    } else {
      message.feederAddr = "";
    }
    return message;
  },

  toJSON(message: QueryFeederDelegationResponse): unknown {
    const obj: any = {};
    message.feederAddr !== undefined && (obj.feederAddr = message.feederAddr);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryFeederDelegationResponse>
  ): QueryFeederDelegationResponse {
    const message = {
      ...baseQueryFeederDelegationResponse,
    } as QueryFeederDelegationResponse;
    if (object.feederAddr !== undefined && object.feederAddr !== null) {
      message.feederAddr = object.feederAddr;
    } else {
      message.feederAddr = "";
    }
    return message;
  },
};

const baseQueryVotePenaltyCounterRequest: object = { validatorAddr: "" };

export const QueryVotePenaltyCounterRequest = {
  encode(
    message: QueryVotePenaltyCounterRequest,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.validatorAddr !== "") {
      writer.uint32(10).string(message.validatorAddr);
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryVotePenaltyCounterRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryVotePenaltyCounterRequest,
    } as QueryVotePenaltyCounterRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryVotePenaltyCounterRequest {
    const message = {
      ...baseQueryVotePenaltyCounterRequest,
    } as QueryVotePenaltyCounterRequest;
    if (object.validatorAddr !== undefined && object.validatorAddr !== null) {
      message.validatorAddr = String(object.validatorAddr);
    } else {
      message.validatorAddr = "";
    }
    return message;
  },

  toJSON(message: QueryVotePenaltyCounterRequest): unknown {
    const obj: any = {};
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryVotePenaltyCounterRequest>
  ): QueryVotePenaltyCounterRequest {
    const message = {
      ...baseQueryVotePenaltyCounterRequest,
    } as QueryVotePenaltyCounterRequest;
    if (object.validatorAddr !== undefined && object.validatorAddr !== null) {
      message.validatorAddr = object.validatorAddr;
    } else {
      message.validatorAddr = "";
    }
    return message;
  },
};

const baseQueryVotePenaltyCounterResponse: object = {};

export const QueryVotePenaltyCounterResponse = {
  encode(
    message: QueryVotePenaltyCounterResponse,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.votePenaltyCounter !== undefined) {
      VotePenaltyCounter.encode(
        message.votePenaltyCounter,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryVotePenaltyCounterResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryVotePenaltyCounterResponse,
    } as QueryVotePenaltyCounterResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.votePenaltyCounter = VotePenaltyCounter.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryVotePenaltyCounterResponse {
    const message = {
      ...baseQueryVotePenaltyCounterResponse,
    } as QueryVotePenaltyCounterResponse;
    if (
      object.votePenaltyCounter !== undefined &&
      object.votePenaltyCounter !== null
    ) {
      message.votePenaltyCounter = VotePenaltyCounter.fromJSON(
        object.votePenaltyCounter
      );
    } else {
      message.votePenaltyCounter = undefined;
    }
    return message;
  },

  toJSON(message: QueryVotePenaltyCounterResponse): unknown {
    const obj: any = {};
    message.votePenaltyCounter !== undefined &&
      (obj.votePenaltyCounter = message.votePenaltyCounter
        ? VotePenaltyCounter.toJSON(message.votePenaltyCounter)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryVotePenaltyCounterResponse>
  ): QueryVotePenaltyCounterResponse {
    const message = {
      ...baseQueryVotePenaltyCounterResponse,
    } as QueryVotePenaltyCounterResponse;
    if (
      object.votePenaltyCounter !== undefined &&
      object.votePenaltyCounter !== null
    ) {
      message.votePenaltyCounter = VotePenaltyCounter.fromPartial(
        object.votePenaltyCounter
      );
    } else {
      message.votePenaltyCounter = undefined;
    }
    return message;
  },
};

const baseQueryAggregatePrevoteRequest: object = { validatorAddr: "" };

export const QueryAggregatePrevoteRequest = {
  encode(
    message: QueryAggregatePrevoteRequest,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.validatorAddr !== "") {
      writer.uint32(10).string(message.validatorAddr);
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryAggregatePrevoteRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryAggregatePrevoteRequest,
    } as QueryAggregatePrevoteRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAggregatePrevoteRequest {
    const message = {
      ...baseQueryAggregatePrevoteRequest,
    } as QueryAggregatePrevoteRequest;
    if (object.validatorAddr !== undefined && object.validatorAddr !== null) {
      message.validatorAddr = String(object.validatorAddr);
    } else {
      message.validatorAddr = "";
    }
    return message;
  },

  toJSON(message: QueryAggregatePrevoteRequest): unknown {
    const obj: any = {};
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryAggregatePrevoteRequest>
  ): QueryAggregatePrevoteRequest {
    const message = {
      ...baseQueryAggregatePrevoteRequest,
    } as QueryAggregatePrevoteRequest;
    if (object.validatorAddr !== undefined && object.validatorAddr !== null) {
      message.validatorAddr = object.validatorAddr;
    } else {
      message.validatorAddr = "";
    }
    return message;
  },
};

const baseQueryAggregatePrevoteResponse: object = {};

export const QueryAggregatePrevoteResponse = {
  encode(
    message: QueryAggregatePrevoteResponse,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.aggregatePrevote !== undefined) {
      AggregateExchangeRatePrevote.encode(
        message.aggregatePrevote,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryAggregatePrevoteResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryAggregatePrevoteResponse,
    } as QueryAggregatePrevoteResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.aggregatePrevote = AggregateExchangeRatePrevote.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAggregatePrevoteResponse {
    const message = {
      ...baseQueryAggregatePrevoteResponse,
    } as QueryAggregatePrevoteResponse;
    if (
      object.aggregatePrevote !== undefined &&
      object.aggregatePrevote !== null
    ) {
      message.aggregatePrevote = AggregateExchangeRatePrevote.fromJSON(
        object.aggregatePrevote
      );
    } else {
      message.aggregatePrevote = undefined;
    }
    return message;
  },

  toJSON(message: QueryAggregatePrevoteResponse): unknown {
    const obj: any = {};
    message.aggregatePrevote !== undefined &&
      (obj.aggregatePrevote = message.aggregatePrevote
        ? AggregateExchangeRatePrevote.toJSON(message.aggregatePrevote)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryAggregatePrevoteResponse>
  ): QueryAggregatePrevoteResponse {
    const message = {
      ...baseQueryAggregatePrevoteResponse,
    } as QueryAggregatePrevoteResponse;
    if (
      object.aggregatePrevote !== undefined &&
      object.aggregatePrevote !== null
    ) {
      message.aggregatePrevote = AggregateExchangeRatePrevote.fromPartial(
        object.aggregatePrevote
      );
    } else {
      message.aggregatePrevote = undefined;
    }
    return message;
  },
};

const baseQueryAggregatePrevotesRequest: object = {};

export const QueryAggregatePrevotesRequest = {
  encode(
    _: QueryAggregatePrevotesRequest,
    writer: Writer = Writer.create()
  ): Writer {
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryAggregatePrevotesRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryAggregatePrevotesRequest,
    } as QueryAggregatePrevotesRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): QueryAggregatePrevotesRequest {
    const message = {
      ...baseQueryAggregatePrevotesRequest,
    } as QueryAggregatePrevotesRequest;
    return message;
  },

  toJSON(_: QueryAggregatePrevotesRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<QueryAggregatePrevotesRequest>
  ): QueryAggregatePrevotesRequest {
    const message = {
      ...baseQueryAggregatePrevotesRequest,
    } as QueryAggregatePrevotesRequest;
    return message;
  },
};

const baseQueryAggregatePrevotesResponse: object = {};

export const QueryAggregatePrevotesResponse = {
  encode(
    message: QueryAggregatePrevotesResponse,
    writer: Writer = Writer.create()
  ): Writer {
    for (const v of message.aggregatePrevotes) {
      AggregateExchangeRatePrevote.encode(
        v!,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryAggregatePrevotesResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryAggregatePrevotesResponse,
    } as QueryAggregatePrevotesResponse;
    message.aggregatePrevotes = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.aggregatePrevotes.push(
            AggregateExchangeRatePrevote.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAggregatePrevotesResponse {
    const message = {
      ...baseQueryAggregatePrevotesResponse,
    } as QueryAggregatePrevotesResponse;
    message.aggregatePrevotes = [];
    if (
      object.aggregatePrevotes !== undefined &&
      object.aggregatePrevotes !== null
    ) {
      for (const e of object.aggregatePrevotes) {
        message.aggregatePrevotes.push(
          AggregateExchangeRatePrevote.fromJSON(e)
        );
      }
    }
    return message;
  },

  toJSON(message: QueryAggregatePrevotesResponse): unknown {
    const obj: any = {};
    if (message.aggregatePrevotes) {
      obj.aggregatePrevotes = message.aggregatePrevotes.map((e) =>
        e ? AggregateExchangeRatePrevote.toJSON(e) : undefined
      );
    } else {
      obj.aggregatePrevotes = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryAggregatePrevotesResponse>
  ): QueryAggregatePrevotesResponse {
    const message = {
      ...baseQueryAggregatePrevotesResponse,
    } as QueryAggregatePrevotesResponse;
    message.aggregatePrevotes = [];
    if (
      object.aggregatePrevotes !== undefined &&
      object.aggregatePrevotes !== null
    ) {
      for (const e of object.aggregatePrevotes) {
        message.aggregatePrevotes.push(
          AggregateExchangeRatePrevote.fromPartial(e)
        );
      }
    }
    return message;
  },
};

const baseQueryAggregateVoteRequest: object = { validatorAddr: "" };

export const QueryAggregateVoteRequest = {
  encode(
    message: QueryAggregateVoteRequest,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.validatorAddr !== "") {
      writer.uint32(10).string(message.validatorAddr);
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryAggregateVoteRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryAggregateVoteRequest,
    } as QueryAggregateVoteRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAggregateVoteRequest {
    const message = {
      ...baseQueryAggregateVoteRequest,
    } as QueryAggregateVoteRequest;
    if (object.validatorAddr !== undefined && object.validatorAddr !== null) {
      message.validatorAddr = String(object.validatorAddr);
    } else {
      message.validatorAddr = "";
    }
    return message;
  },

  toJSON(message: QueryAggregateVoteRequest): unknown {
    const obj: any = {};
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryAggregateVoteRequest>
  ): QueryAggregateVoteRequest {
    const message = {
      ...baseQueryAggregateVoteRequest,
    } as QueryAggregateVoteRequest;
    if (object.validatorAddr !== undefined && object.validatorAddr !== null) {
      message.validatorAddr = object.validatorAddr;
    } else {
      message.validatorAddr = "";
    }
    return message;
  },
};

const baseQueryAggregateVoteResponse: object = {};

export const QueryAggregateVoteResponse = {
  encode(
    message: QueryAggregateVoteResponse,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.aggregateVote !== undefined) {
      AggregateExchangeRateVote.encode(
        message.aggregateVote,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryAggregateVoteResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryAggregateVoteResponse,
    } as QueryAggregateVoteResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.aggregateVote = AggregateExchangeRateVote.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAggregateVoteResponse {
    const message = {
      ...baseQueryAggregateVoteResponse,
    } as QueryAggregateVoteResponse;
    if (object.aggregateVote !== undefined && object.aggregateVote !== null) {
      message.aggregateVote = AggregateExchangeRateVote.fromJSON(
        object.aggregateVote
      );
    } else {
      message.aggregateVote = undefined;
    }
    return message;
  },

  toJSON(message: QueryAggregateVoteResponse): unknown {
    const obj: any = {};
    message.aggregateVote !== undefined &&
      (obj.aggregateVote = message.aggregateVote
        ? AggregateExchangeRateVote.toJSON(message.aggregateVote)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryAggregateVoteResponse>
  ): QueryAggregateVoteResponse {
    const message = {
      ...baseQueryAggregateVoteResponse,
    } as QueryAggregateVoteResponse;
    if (object.aggregateVote !== undefined && object.aggregateVote !== null) {
      message.aggregateVote = AggregateExchangeRateVote.fromPartial(
        object.aggregateVote
      );
    } else {
      message.aggregateVote = undefined;
    }
    return message;
  },
};

const baseQueryAggregateVotesRequest: object = {};

export const QueryAggregateVotesRequest = {
  encode(
    _: QueryAggregateVotesRequest,
    writer: Writer = Writer.create()
  ): Writer {
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryAggregateVotesRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryAggregateVotesRequest,
    } as QueryAggregateVotesRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): QueryAggregateVotesRequest {
    const message = {
      ...baseQueryAggregateVotesRequest,
    } as QueryAggregateVotesRequest;
    return message;
  },

  toJSON(_: QueryAggregateVotesRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<QueryAggregateVotesRequest>
  ): QueryAggregateVotesRequest {
    const message = {
      ...baseQueryAggregateVotesRequest,
    } as QueryAggregateVotesRequest;
    return message;
  },
};

const baseQueryAggregateVotesResponse: object = {};

export const QueryAggregateVotesResponse = {
  encode(
    message: QueryAggregateVotesResponse,
    writer: Writer = Writer.create()
  ): Writer {
    for (const v of message.aggregateVotes) {
      AggregateExchangeRateVote.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): QueryAggregateVotesResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryAggregateVotesResponse,
    } as QueryAggregateVotesResponse;
    message.aggregateVotes = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.aggregateVotes.push(
            AggregateExchangeRateVote.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAggregateVotesResponse {
    const message = {
      ...baseQueryAggregateVotesResponse,
    } as QueryAggregateVotesResponse;
    message.aggregateVotes = [];
    if (object.aggregateVotes !== undefined && object.aggregateVotes !== null) {
      for (const e of object.aggregateVotes) {
        message.aggregateVotes.push(AggregateExchangeRateVote.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: QueryAggregateVotesResponse): unknown {
    const obj: any = {};
    if (message.aggregateVotes) {
      obj.aggregateVotes = message.aggregateVotes.map((e) =>
        e ? AggregateExchangeRateVote.toJSON(e) : undefined
      );
    } else {
      obj.aggregateVotes = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryAggregateVotesResponse>
  ): QueryAggregateVotesResponse {
    const message = {
      ...baseQueryAggregateVotesResponse,
    } as QueryAggregateVotesResponse;
    message.aggregateVotes = [];
    if (object.aggregateVotes !== undefined && object.aggregateVotes !== null) {
      for (const e of object.aggregateVotes) {
        message.aggregateVotes.push(AggregateExchangeRateVote.fromPartial(e));
      }
    }
    return message;
  },
};

const baseQueryParamsRequest: object = {};

export const QueryParamsRequest = {
  encode(_: QueryParamsRequest, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryParamsRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryParamsRequest } as QueryParamsRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): QueryParamsRequest {
    const message = { ...baseQueryParamsRequest } as QueryParamsRequest;
    return message;
  },

  toJSON(_: QueryParamsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<QueryParamsRequest>): QueryParamsRequest {
    const message = { ...baseQueryParamsRequest } as QueryParamsRequest;
    return message;
  },
};

const baseQueryParamsResponse: object = {};

export const QueryParamsResponse = {
  encode(
    message: QueryParamsResponse,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryParamsResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryParamsResponse } as QueryParamsResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryParamsResponse {
    const message = { ...baseQueryParamsResponse } as QueryParamsResponse;
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromJSON(object.params);
    } else {
      message.params = undefined;
    }
    return message;
  },

  toJSON(message: QueryParamsResponse): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryParamsResponse>): QueryParamsResponse {
    const message = { ...baseQueryParamsResponse } as QueryParamsResponse;
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromPartial(object.params);
    } else {
      message.params = undefined;
    }
    return message;
  },
};

/** Query defines the gRPC querier service. */
export interface Query {
  /** ExchangeRate returns exchange rate of a denom */
  ExchangeRate(
    request: QueryExchangeRateRequest
  ): Promise<QueryExchangeRateResponse>;
  /** ExchangeRates returns exchange rates of all denoms */
  ExchangeRates(
    request: QueryExchangeRatesRequest
  ): Promise<QueryExchangeRatesResponse>;
  /** Actives returns all active denoms */
  Actives(request: QueryActivesRequest): Promise<QueryActivesResponse>;
  /** VoteTargets returns all vote target denoms */
  VoteTargets(
    request: QueryVoteTargetsRequest
  ): Promise<QueryVoteTargetsResponse>;
  /** PriceSnapshotHistory returns the history of price snapshots for all assets */
  PriceSnapshotHistory(
    request: QueryPriceSnapshotHistoryRequest
  ): Promise<QueryPriceSnapshotHistoryResponse>;
  Twaps(request: QueryTwapsRequest): Promise<QueryTwapsResponse>;
  /** FeederDelegation returns feeder delegation of a validator */
  FeederDelegation(
    request: QueryFeederDelegationRequest
  ): Promise<QueryFeederDelegationResponse>;
  /** MissCounter returns oracle miss counter of a validator */
  VotePenaltyCounter(
    request: QueryVotePenaltyCounterRequest
  ): Promise<QueryVotePenaltyCounterResponse>;
  /** AggregatePrevote returns an aggregate prevote of a validator */
  AggregatePrevote(
    request: QueryAggregatePrevoteRequest
  ): Promise<QueryAggregatePrevoteResponse>;
  /** AggregatePrevotes returns aggregate prevotes of all validators */
  AggregatePrevotes(
    request: QueryAggregatePrevotesRequest
  ): Promise<QueryAggregatePrevotesResponse>;
  /** AggregateVote returns an aggregate vote of a validator */
  AggregateVote(
    request: QueryAggregateVoteRequest
  ): Promise<QueryAggregateVoteResponse>;
  /** AggregateVotes returns aggregate votes of all validators */
  AggregateVotes(
    request: QueryAggregateVotesRequest
  ): Promise<QueryAggregateVotesResponse>;
  /** Params queries all parameters. */
  Params(request: QueryParamsRequest): Promise<QueryParamsResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
  }
  ExchangeRate(
    request: QueryExchangeRateRequest
  ): Promise<QueryExchangeRateResponse> {
    const data = QueryExchangeRateRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "ExchangeRate",
      data
    );
    return promise.then((data) =>
      QueryExchangeRateResponse.decode(new Reader(data))
    );
  }

  ExchangeRates(
    request: QueryExchangeRatesRequest
  ): Promise<QueryExchangeRatesResponse> {
    const data = QueryExchangeRatesRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "ExchangeRates",
      data
    );
    return promise.then((data) =>
      QueryExchangeRatesResponse.decode(new Reader(data))
    );
  }

  Actives(request: QueryActivesRequest): Promise<QueryActivesResponse> {
    const data = QueryActivesRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "Actives",
      data
    );
    return promise.then((data) =>
      QueryActivesResponse.decode(new Reader(data))
    );
  }

  VoteTargets(
    request: QueryVoteTargetsRequest
  ): Promise<QueryVoteTargetsResponse> {
    const data = QueryVoteTargetsRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "VoteTargets",
      data
    );
    return promise.then((data) =>
      QueryVoteTargetsResponse.decode(new Reader(data))
    );
  }

  PriceSnapshotHistory(
    request: QueryPriceSnapshotHistoryRequest
  ): Promise<QueryPriceSnapshotHistoryResponse> {
    const data = QueryPriceSnapshotHistoryRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "PriceSnapshotHistory",
      data
    );
    return promise.then((data) =>
      QueryPriceSnapshotHistoryResponse.decode(new Reader(data))
    );
  }

  Twaps(request: QueryTwapsRequest): Promise<QueryTwapsResponse> {
    const data = QueryTwapsRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "Twaps",
      data
    );
    return promise.then((data) => QueryTwapsResponse.decode(new Reader(data)));
  }

  FeederDelegation(
    request: QueryFeederDelegationRequest
  ): Promise<QueryFeederDelegationResponse> {
    const data = QueryFeederDelegationRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "FeederDelegation",
      data
    );
    return promise.then((data) =>
      QueryFeederDelegationResponse.decode(new Reader(data))
    );
  }

  VotePenaltyCounter(
    request: QueryVotePenaltyCounterRequest
  ): Promise<QueryVotePenaltyCounterResponse> {
    const data = QueryVotePenaltyCounterRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "VotePenaltyCounter",
      data
    );
    return promise.then((data) =>
      QueryVotePenaltyCounterResponse.decode(new Reader(data))
    );
  }

  AggregatePrevote(
    request: QueryAggregatePrevoteRequest
  ): Promise<QueryAggregatePrevoteResponse> {
    const data = QueryAggregatePrevoteRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "AggregatePrevote",
      data
    );
    return promise.then((data) =>
      QueryAggregatePrevoteResponse.decode(new Reader(data))
    );
  }

  AggregatePrevotes(
    request: QueryAggregatePrevotesRequest
  ): Promise<QueryAggregatePrevotesResponse> {
    const data = QueryAggregatePrevotesRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "AggregatePrevotes",
      data
    );
    return promise.then((data) =>
      QueryAggregatePrevotesResponse.decode(new Reader(data))
    );
  }

  AggregateVote(
    request: QueryAggregateVoteRequest
  ): Promise<QueryAggregateVoteResponse> {
    const data = QueryAggregateVoteRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "AggregateVote",
      data
    );
    return promise.then((data) =>
      QueryAggregateVoteResponse.decode(new Reader(data))
    );
  }

  AggregateVotes(
    request: QueryAggregateVotesRequest
  ): Promise<QueryAggregateVotesResponse> {
    const data = QueryAggregateVotesRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "AggregateVotes",
      data
    );
    return promise.then((data) =>
      QueryAggregateVotesResponse.decode(new Reader(data))
    );
  }

  Params(request: QueryParamsRequest): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request(
      "seiprotocol.seichain.oracle.Query",
      "Params",
      data
    );
    return promise.then((data) => QueryParamsResponse.decode(new Reader(data)));
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
