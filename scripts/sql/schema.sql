--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    email character varying NOT NULL,
    username character varying,
    friend_id character varying,
    is_public boolean DEFAULT false,
    is_active_trading boolean DEFAULT false,
    collection_last_updated timestamp with time zone,
    completed_missions character varying[],
    language character(2),
    last_active timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT username_min_length CHECK (((username IS NULL) OR (length((username)::text) >= 2)))
);


--
-- Name: TABLE accounts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.accounts IS 'Holds the username/friend-id';


--
-- Name: card_amounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_amounts (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    amount_owned smallint DEFAULT '0'::smallint NOT NULL,
    email character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    internal_id integer NOT NULL,
    amount_wanted integer,
    CONSTRAINT chk_amount_nonnegative CHECK ((amount_owned >= 0))
);


--
-- Name: cards_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cards_list (
    card_id character varying NOT NULL,
    rarity character varying NOT NULL,
    tradable boolean DEFAULT false NOT NULL,
    internal_id integer NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collection (
    email character varying NOT NULL,
    card_id character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    internal_id integer
);


--
-- Name: TABLE collection; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.collection IS 'Holds the card collections';


--
-- Name: deck_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deck_likes (
    id integer NOT NULL,
    email character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: decks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decks (
    id integer NOT NULL,
    email character varying NOT NULL,
    is_public boolean NOT NULL,
    name character varying(64) NOT NULL,
    energy character varying(24)[] NOT NULL,
    cards integer[] NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT decks_energy_check CHECK ((array_length(energy, 1) > 0)),
    CONSTRAINT decks_name_check CHECK ((length((name)::text) > 0))
);


--
-- Name: decks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.decks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: decks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.decks_id_seq OWNED BY public.decks.id;


--
-- Name: friends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friends (
    id bigint NOT NULL,
    email_requester text NOT NULL,
    email_accepter text NOT NULL,
    state character varying(16) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    username_requester text NOT NULL,
    username_accepter text NOT NULL,
    friend_id_requester text DEFAULT ''::text NOT NULL,
    friend_id_accepter text DEFAULT ''::text NOT NULL,
    CONSTRAINT friends_distinct_pair CHECK ((email_requester <> email_accepter)),
    CONSTRAINT friends_state_check CHECK (((state)::text = ANY (ARRAY['accepted'::text, 'declined'::text, 'revoked'::text, 'pending'::text])))
);


--
-- Name: friends_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.friends_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: friends_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.friends_id_seq OWNED BY public.friends.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    sender_friend_id text NOT NULL,
    receiver_friend_id text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: trade_rarity_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trade_rarity_settings (
    email character varying NOT NULL,
    rarity character varying NOT NULL,
    to_collect numeric DEFAULT '0'::numeric NOT NULL,
    to_keep numeric DEFAULT '0'::numeric NOT NULL,
    rarity_id smallint GENERATED ALWAYS AS (
CASE rarity
    WHEN '◊'::text THEN 0
    WHEN '◊◊'::text THEN 1
    WHEN '◊◊◊'::text THEN 2
    WHEN '◊◊◊◊'::text THEN 3
    WHEN '☆'::text THEN 4
    WHEN '☆☆'::text THEN 5
    WHEN '☆☆☆'::text THEN 6
    WHEN '✵'::text THEN 8
    WHEN '✵✵'::text THEN 9
    WHEN 'Crown Rare'::text THEN 12
    WHEN 'P'::text THEN 16
    ELSE NULL::integer
END) STORED
);


--
-- Name: public_accounts; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.public_accounts AS
 SELECT a.username,
    a.friend_id,
    a.is_active_trading,
    array_agg(json_build_object('rarity', t.rarity, 'to_collect', t.to_collect, 'to_keep', t.to_keep)) AS trade_rarity_settings
   FROM (public.accounts a
     LEFT JOIN public.trade_rarity_settings t ON (((a.email)::text = (t.email)::text)))
  WHERE (a.is_public = true)
  GROUP BY a.username, a.friend_id, a.is_active_trading;


--
-- Name: public_card_amounts_collection; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.public_card_amounts_collection AS
 SELECT a.friend_id,
    ca.internal_id,
    ca.amount_owned,
    ca.amount_wanted,
    array_agg(c.card_id) AS collection
   FROM ((public.card_amounts ca
     LEFT JOIN public.accounts a ON (((ca.email)::text = (a.email)::text)))
     LEFT JOIN public.collection c ON (((ca.internal_id = c.internal_id) AND ((ca.email)::text = (c.email)::text))))
  WHERE (a.is_public = true)
  GROUP BY a.friend_id, ca.internal_id, ca.amount_owned, ca.amount_wanted;


--
-- Name: public_decks; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.public_decks AS
SELECT
    NULL::integer AS id,
    NULL::character varying(64) AS name,
    NULL::character varying AS username,
    NULL::character varying(24)[] AS energy,
    NULL::integer[] AS cards,
    NULL::timestamp with time zone AS created_at,
    NULL::timestamp with time zone AS updated_at,
    NULL::bigint AS likes;


--
-- Name: trades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trades (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    offering_friend_id character varying NOT NULL,
    receiving_friend_id character varying NOT NULL,
    offer_card_id character varying,
    receiver_card_id character varying,
    status character varying NOT NULL,
    offerer_ended boolean DEFAULT false NOT NULL,
    receiver_ended boolean DEFAULT false NOT NULL
);


--
-- Name: trading_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.trades ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.trading_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: decks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decks ALTER COLUMN id SET DEFAULT nextval('public.decks_id_seq'::regclass);


--
-- Name: friends id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends ALTER COLUMN id SET DEFAULT nextval('public.friends_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: accounts accounts_friend_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_friend_id_unique UNIQUE (friend_id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (email);


--
-- Name: card_amounts card_amounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_amounts
    ADD CONSTRAINT card_amounts_pkey PRIMARY KEY (email, internal_id);


--
-- Name: cards_list cards_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards_list
    ADD CONSTRAINT cards_list_pkey PRIMARY KEY (internal_id);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (email, card_id);


--
-- Name: deck_likes deck_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_likes
    ADD CONSTRAINT deck_likes_pkey PRIMARY KEY (id, email);


--
-- Name: decks decks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decks
    ADD CONSTRAINT decks_pkey PRIMARY KEY (id);


--
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: trade_rarity_settings trade_rarity_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trade_rarity_settings
    ADD CONSTRAINT trade_rarity_settings_pkey PRIMARY KEY (email, rarity);


--
-- Name: trades trading_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trading_pkey PRIMARY KEY (id);


--
-- Name: idx_accounts_active_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_active_email ON public.accounts USING btree (email) WHERE (is_active_trading = true);


--
-- Name: idx_accounts_collection_last_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_collection_last_updated ON public.accounts USING btree (collection_last_updated);


--
-- Name: idx_accounts_recent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_recent ON public.accounts USING btree (is_active_trading, is_public, last_active DESC);


--
-- Name: idx_card_amounts_email_internal_id_amount; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_amounts_email_internal_id_amount ON public.card_amounts USING btree (email, internal_id) INCLUDE (amount_owned);


--
-- Name: idx_card_amounts_email_rarity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_amounts_email_rarity_id ON public.card_amounts USING btree (email, ((internal_id & 63)));


--
-- Name: idx_cards_list_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_list_card_id ON public.cards_list USING btree (card_id);


--
-- Name: idx_cards_list_rarity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_list_rarity_id ON public.cards_list USING btree (((internal_id & 63))) INCLUDE (internal_id);


--
-- Name: idx_collection_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collection_card_id ON public.collection USING btree (card_id);


--
-- Name: idx_collection_email_internal_id_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collection_email_internal_id_card_id ON public.collection USING btree (email, internal_id, card_id);


--
-- Name: idx_collection_internal_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collection_internal_id ON public.collection USING btree (internal_id);


--
-- Name: idx_friends_accepter; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_friends_accepter ON public.friends USING btree (email_accepter);


--
-- Name: idx_friends_requester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_friends_requester ON public.friends USING btree (email_requester);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (LEAST(sender_friend_id, receiver_friend_id), GREATEST(sender_friend_id, receiver_friend_id), created_at);


--
-- Name: idx_trade_rarity_settings_email_rarity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trade_rarity_settings_email_rarity_id ON public.trade_rarity_settings USING btree (email, rarity_id) INCLUDE (to_keep, to_collect);


--
-- Name: public_decks _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.public_decks AS
 SELECT d.id,
    d.name,
    a.username,
    d.energy,
    d.cards,
    d.created_at,
    d.updated_at,
    count(dl.email) AS likes
   FROM ((public.decks d
     LEFT JOIN public.deck_likes dl ON ((dl.id = d.id)))
     LEFT JOIN public.accounts a ON (((a.email)::text = (d.email)::text)))
  WHERE (d.is_public = true)
  GROUP BY d.id, a.username, d.name, d.energy, d.cards;


--
-- Name: collection collection_card_amounts_internal_id_email_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT collection_card_amounts_internal_id_email_fk FOREIGN KEY (internal_id, email) REFERENCES public.card_amounts(internal_id, email);


--
-- Name: deck_likes deck_likes_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_likes
    ADD CONSTRAINT deck_likes_email_fkey FOREIGN KEY (email) REFERENCES public.accounts(email) ON UPDATE CASCADE;


--
-- Name: deck_likes deck_likes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_likes
    ADD CONSTRAINT deck_likes_id_fkey FOREIGN KEY (id) REFERENCES public.decks(id);


--
-- Name: decks decks_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decks
    ADD CONSTRAINT decks_email_fkey FOREIGN KEY (email) REFERENCES public.accounts(email) ON UPDATE CASCADE;


--
-- Name: friends friends_accepter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_accepter_fkey FOREIGN KEY (email_accepter) REFERENCES public.accounts(email) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: friends friends_requester_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_requester_fkey FOREIGN KEY (email_requester) REFERENCES public.accounts(email) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: trade_rarity_settings trade_rarity_settings_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trade_rarity_settings
    ADD CONSTRAINT trade_rarity_settings_email_fkey FOREIGN KEY (email) REFERENCES public.accounts(email) ON UPDATE CASCADE;


--
-- Name: messages Receivers can mark messages as read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Receivers can mark messages as read" ON public.messages FOR UPDATE USING ((receiver_friend_id IN ( SELECT accounts.friend_id
   FROM public.accounts
  WHERE ((accounts.email)::text = (auth.jwt() ->> 'email'::text))))) WITH CHECK ((receiver_friend_id IN ( SELECT accounts.friend_id
   FROM public.accounts
  WHERE ((accounts.email)::text = (auth.jwt() ->> 'email'::text)))));


--
-- Name: messages Users can insert own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK ((sender_friend_id IN ( SELECT accounts.friend_id
   FROM public.accounts
  WHERE ((accounts.email)::text = (auth.jwt() ->> 'email'::text)))));


--
-- Name: messages Users can view own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (((sender_friend_id IN ( SELECT accounts.friend_id
   FROM public.accounts
  WHERE ((accounts.email)::text = (auth.jwt() ->> 'email'::text)))) OR (receiver_friend_id IN ( SELECT accounts.friend_id
   FROM public.accounts
  WHERE ((accounts.email)::text = (auth.jwt() ->> 'email'::text))))));


--
-- Name: accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: card_amounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.card_amounts ENABLE ROW LEVEL SECURITY;

--
-- Name: cards_list; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cards_list ENABLE ROW LEVEL SECURITY;

--
-- Name: collection; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collection ENABLE ROW LEVEL SECURITY;

--
-- Name: deck_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deck_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: decks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

--
-- Name: deck_likes ensure only own rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ensure only own rows" ON public.deck_likes USING (((email)::text = ( SELECT auth.email() AS email)));


--
-- Name: decks ensure only own rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ensure only own rows" ON public.decks USING (((email)::text = ( SELECT auth.email() AS email)));


--
-- Name: card_amounts ensure-only-own-rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ensure-only-own-rows" ON public.card_amounts USING (((email)::text = ( SELECT auth.email() AS email)));


--
-- Name: collection ensure-only-own-rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ensure-only-own-rows" ON public.collection USING (((email)::text = ( SELECT auth.email() AS email)));


--
-- Name: trades ensure-only-own-rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ensure-only-own-rows" ON public.trades USING ((((( SELECT accounts.email
   FROM public.accounts
  WHERE ((accounts.friend_id)::text = (trades.offering_friend_id)::text)))::text = ( SELECT auth.email() AS email)) OR ((( SELECT accounts.email
   FROM public.accounts
  WHERE ((accounts.friend_id)::text = (trades.receiving_friend_id)::text)))::text = ( SELECT auth.email() AS email))));


--
-- Name: accounts ensure-own-rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ensure-own-rows" ON public.accounts USING (((email)::text = ( SELECT auth.email() AS email)));


--
-- Name: friends ensure-own-rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ensure-own-rows" ON public.friends USING (((email_requester = ( SELECT auth.email() AS email)) OR (email_accepter = ( SELECT auth.email() AS email))));


--
-- Name: trade_rarity_settings ensure-own-rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ensure-own-rows" ON public.trade_rarity_settings USING (((email)::text = ( SELECT auth.email() AS email)));


--
-- Name: friends; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

--
-- Name: accounts greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.accounts FOR SELECT TO greg USING (true);


--
-- Name: card_amounts greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.card_amounts FOR SELECT TO greg USING (true);


--
-- Name: cards_list greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.cards_list FOR SELECT TO greg USING (true);


--
-- Name: collection greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.collection FOR SELECT TO greg USING (true);


--
-- Name: deck_likes greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.deck_likes FOR SELECT TO greg USING (true);


--
-- Name: decks greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.decks FOR SELECT TO greg USING (true);


--
-- Name: friends greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.friends FOR SELECT TO greg USING (true);


--
-- Name: trade_rarity_settings greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.trade_rarity_settings FOR SELECT TO greg USING (true);


--
-- Name: trades greg; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY greg ON public.trades FOR SELECT TO greg USING (true);


--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: trade_rarity_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trade_rarity_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: trades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

