--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

-- Started on 2025-05-12 21:28:17

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
-- TOC entry 280 (class 1255 OID 16474)
-- Name: update_average_rating(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_average_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE hotels
    SET average_rating = (SELECT AVG(rating) FROM reviews WHERE hotel_id = NEW.hotel_id),
        review_count = (SELECT COUNT(*) FROM reviews WHERE hotel_id = NEW.hotel_id)
    WHERE id = NEW.hotel_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_average_rating() OWNER TO postgres;

--
-- TOC entry 296 (class 1255 OID 16491)
-- Name: update_average_ratings(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_average_ratings() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM average_ratings WHERE hotel_id = NEW.hotel_id) THEN
        INSERT INTO average_ratings (hotel_id)
        VALUES (NEW.hotel_id);
    END IF;

    -- Оновлення середніх оцінок
    UPDATE average_ratings
    SET 
        food_avg = (SELECT AVG(food_rating) FROM reviews WHERE hotel_id = NEW.hotel_id),
        room_avg = (SELECT AVG(room_rating) FROM reviews WHERE hotel_id = NEW.hotel_id),
        staff_avg = (SELECT AVG(staff_rating) FROM reviews WHERE hotel_id = NEW.hotel_id),
        price_avg = (SELECT AVG(price_rating) FROM reviews WHERE hotel_id = NEW.hotel_id),
        beach_avg = (SELECT AVG(beach_rating) FROM reviews WHERE hotel_id = NEW.hotel_id),
        animation_avg = (SELECT AVG(animation_rating) FROM reviews WHERE hotel_id = NEW.hotel_id)
    WHERE hotel_id = NEW.hotel_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_average_ratings() OWNER TO postgres;

--
-- TOC entry 283 (class 1255 OID 33955)
-- Name: update_hotel_amenities(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_hotel_amenities() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE hotels
  SET amenities = 
    CASE 
      WHEN array_length(NEW.description, 1) >= 4 THEN NEW.description[1:4]
      ELSE NEW.description
    END
  WHERE id = NEW.hotel_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_hotel_amenities() OWNER TO postgres;

--
-- TOC entry 282 (class 1255 OID 25755)
-- Name: update_hotel_photos(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_hotel_photos() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT hotel_photos FROM hotels WHERE id = NEW.hotel_id) IS NULL THEN
        UPDATE hotels
        SET hotel_photos = NEW.photo_url
        WHERE id = NEW.hotel_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_hotel_photos() OWNER TO postgres;

--
-- TOC entry 281 (class 1255 OID 17162)
-- Name: update_last_modified(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_last_modified() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_modified = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_last_modified() OWNER TO postgres;

--
-- TOC entry 284 (class 1255 OID 25760)
-- Name: update_total_orders(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_total_orders() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status = 'завершено' THEN
        UPDATE public.hotels
        SET total_orders = (
            SELECT COUNT(*) 
            FROM public.booking 
            WHERE hotel_id = NEW.hotel_id AND status = 'завершено'
        )
        WHERE id = NEW.hotel_id;
    END IF;

    IF OLD.status = 'завершено' AND NEW.status != 'завершено' THEN
        UPDATE public.hotels
        SET total_orders = (
            SELECT COUNT(*) 
            FROM public.booking 
            WHERE hotel_id = OLD.hotel_id AND status = 'завершено'
        )
        WHERE id = OLD.hotel_id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_total_orders() OWNER TO postgres;

--
-- TOC entry 279 (class 1255 OID 16443)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 16478)
-- Name: average_ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.average_ratings (
    id integer NOT NULL,
    hotel_id integer,
    food_avg numeric,
    room_avg numeric,
    staff_avg numeric,
    price_avg numeric,
    beach_avg numeric,
    animation_avg numeric
);


ALTER TABLE public.average_ratings OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16477)
-- Name: average_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.average_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.average_ratings_id_seq OWNER TO postgres;

--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 223
-- Name: average_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.average_ratings_id_seq OWNED BY public.average_ratings.id;


--
-- TOC entry 230 (class 1259 OID 16637)
-- Name: hotel_beach; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_beach (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_beach OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16636)
-- Name: beach_features_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beach_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beach_features_id_seq OWNER TO postgres;

--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 229
-- Name: beach_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beach_features_id_seq OWNED BY public.hotel_beach.id;


--
-- TOC entry 266 (class 1259 OID 17132)
-- Name: booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking (
    id integer NOT NULL,
    user_id integer,
    hotel_id integer,
    room_type_id integer,
    meal_plan_id integer,
    total_price numeric(10,2) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    number_of_tourists integer NOT NULL,
    number_of_children integer,
    departure_airport character varying(100),
    status character varying(20) DEFAULT 'очікується'::character varying NOT NULL,
    last_modified timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_edited boolean DEFAULT false,
    CONSTRAINT booking_status_check CHECK (((status)::text = ANY (ARRAY['дані заповнено'::text, 'очікується'::text, 'підтверджено'::text, 'скасовано'::text, 'завершено'::text])))
);


ALTER TABLE public.booking OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 17165)
-- Name: booking_children; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_children (
    id integer NOT NULL,
    booking_id integer,
    age integer NOT NULL
);


ALTER TABLE public.booking_children OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 17164)
-- Name: booking_children_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_children_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_children_id_seq OWNER TO postgres;

--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 267
-- Name: booking_children_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_children_id_seq OWNED BY public.booking_children.id;


--
-- TOC entry 274 (class 1259 OID 17231)
-- Name: booking_contract; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_contract (
    id integer NOT NULL,
    booking_id integer,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    middle_name character varying(50),
    citizenship character varying(50),
    date_of_birth date NOT NULL,
    document_type character varying(50),
    document_series character varying(20),
    document_number character varying(20) NOT NULL,
    document_issued_date date,
    phone_number character varying(20) NOT NULL,
    email character varying(100) NOT NULL,
    registration_address text NOT NULL
);


ALTER TABLE public.booking_contract OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 17230)
-- Name: booking_contract_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_contract_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_contract_id_seq OWNER TO postgres;

--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 273
-- Name: booking_contract_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_contract_id_seq OWNED BY public.booking_contract.id;


--
-- TOC entry 278 (class 1259 OID 33964)
-- Name: booking_flight; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_flight (
    id integer NOT NULL,
    booking_id integer,
    departure_time timestamp with time zone NOT NULL,
    arrival_time timestamp with time zone NOT NULL,
    departure_date date NOT NULL,
    arrival_date date NOT NULL,
    departure_location character varying(100) NOT NULL,
    arrival_location character varying(100) NOT NULL,
    airline character varying(100),
    flight_number character varying(20),
    baggage_allowance_kg integer DEFAULT 20,
    carry_on_allowance_kg integer DEFAULT 5,
    price_baggage_allowance numeric(10,2) DEFAULT 0,
    price_carry_on_allowance numeric(10,2) DEFAULT 0,
    direction character varying(20) NOT NULL
);


ALTER TABLE public.booking_flight OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 33963)
-- Name: booking_flight_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_flight_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_flight_id_seq OWNER TO postgres;

--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 277
-- Name: booking_flight_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_flight_id_seq OWNED BY public.booking_flight.id;


--
-- TOC entry 265 (class 1259 OID 17131)
-- Name: booking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_id_seq OWNER TO postgres;

--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 265
-- Name: booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_id_seq OWNED BY public.booking.id;


--
-- TOC entry 270 (class 1259 OID 17195)
-- Name: booking_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_services (
    id integer NOT NULL,
    booking_id integer,
    service_type character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    details character varying(255),
    insurance_period character varying(50),
    price numeric(10,2) NOT NULL,
    CONSTRAINT booking_services_service_type_check CHECK (((service_type)::text = ANY ((ARRAY['страхування'::character varying, 'трансфер'::character varying])::text[])))
);


ALTER TABLE public.booking_services OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 17194)
-- Name: booking_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_services_id_seq OWNER TO postgres;

--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 269
-- Name: booking_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_services_id_seq OWNED BY public.booking_services.id;


--
-- TOC entry 272 (class 1259 OID 17210)
-- Name: booking_tourists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_tourists (
    id integer NOT NULL,
    booking_id integer,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    salutation character varying(10),
    gender character varying(10),
    country_of_birth character varying(50),
    citizenship character varying(50),
    date_of_birth date NOT NULL,
    document_type character varying(20),
    document_series character varying(20),
    document_number character varying(20) NOT NULL,
    document_issued_date date,
    document_valid_until date,
    phone_number character varying(20),
    email character varying(100)
);


ALTER TABLE public.booking_tourists OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 17209)
-- Name: booking_tourists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_tourists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_tourists_id_seq OWNER TO postgres;

--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 271
-- Name: booking_tourists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_tourists_id_seq OWNED BY public.booking_tourists.id;


--
-- TOC entry 276 (class 1259 OID 25764)
-- Name: company_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_reviews (
    id integer NOT NULL,
    user_id integer,
    hotel_id integer NOT NULL,
    rating smallint,
    comment text,
    start_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT company_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.company_reviews OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 25763)
-- Name: company_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 275
-- Name: company_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_reviews_id_seq OWNED BY public.company_reviews.id;


--
-- TOC entry 248 (class 1259 OID 16794)
-- Name: contact_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_forms (
    id integer NOT NULL,
    name character varying NOT NULL,
    phone_number character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contact_forms OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16793)
-- Name: contact_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_forms_id_seq OWNER TO postgres;

--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 247
-- Name: contact_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_forms_id_seq OWNED BY public.contact_forms.id;


--
-- TOC entry 250 (class 1259 OID 16804)
-- Name: email_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_subscribers (
    id integer NOT NULL,
    email character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_subscribers OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16803)
-- Name: email_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_subscribers_id_seq OWNER TO postgres;

--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 249
-- Name: email_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_subscribers_id_seq OWNED BY public.email_subscribers.id;


--
-- TOC entry 234 (class 1259 OID 16665)
-- Name: hotel_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_activities (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_activities OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16664)
-- Name: hotel_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_activities_id_seq OWNER TO postgres;

--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 233
-- Name: hotel_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_activities_id_seq OWNED BY public.hotel_activities.id;


--
-- TOC entry 258 (class 1259 OID 17076)
-- Name: hotel_airport_distance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_airport_distance (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_airport_distance OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 17075)
-- Name: hotel_airport_distance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_airport_distance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_airport_distance_id_seq OWNER TO postgres;

--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 257
-- Name: hotel_airport_distance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_airport_distance_id_seq OWNED BY public.hotel_airport_distance.id;


--
-- TOC entry 256 (class 1259 OID 17062)
-- Name: hotel_amenities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_amenities (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_amenities OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17061)
-- Name: hotel_amenities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_amenities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_amenities_id_seq OWNER TO postgres;

--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 255
-- Name: hotel_amenities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_amenities_id_seq OWNED BY public.hotel_amenities.id;


--
-- TOC entry 260 (class 1259 OID 17090)
-- Name: hotel_communication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_communication (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_communication OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 17089)
-- Name: hotel_communication_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_communication_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_communication_id_seq OWNER TO postgres;

--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 259
-- Name: hotel_communication_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_communication_id_seq OWNED BY public.hotel_communication.id;


--
-- TOC entry 242 (class 1259 OID 16721)
-- Name: hotel_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_contacts (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_contacts OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16720)
-- Name: hotel_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_contacts_id_seq OWNER TO postgres;

--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 241
-- Name: hotel_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_contacts_id_seq OWNED BY public.hotel_contacts.id;


--
-- TOC entry 226 (class 1259 OID 16493)
-- Name: hotel_gallery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_gallery (
    id integer NOT NULL,
    hotel_id integer,
    photo_url text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hotel_gallery OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16492)
-- Name: hotel_gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_gallery_id_seq OWNER TO postgres;

--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 225
-- Name: hotel_gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_gallery_id_seq OWNED BY public.hotel_gallery.id;


--
-- TOC entry 232 (class 1259 OID 16651)
-- Name: hotel_general; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_general (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_general OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16650)
-- Name: hotel_general_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_general_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_general_id_seq OWNER TO postgres;

--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 231
-- Name: hotel_general_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_general_id_seq OWNED BY public.hotel_general.id;


--
-- TOC entry 262 (class 1259 OID 17104)
-- Name: hotel_kids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_kids (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_kids OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 17103)
-- Name: hotel_kids_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_kids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_kids_id_seq OWNER TO postgres;

--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 261
-- Name: hotel_kids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_kids_id_seq OWNED BY public.hotel_kids.id;


--
-- TOC entry 228 (class 1259 OID 16583)
-- Name: hotel_location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_location (
    id integer NOT NULL,
    hotel_id integer,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL
);


ALTER TABLE public.hotel_location OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16582)
-- Name: hotel_location_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_location_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_location_id_seq OWNER TO postgres;

--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 227
-- Name: hotel_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_location_id_seq OWNED BY public.hotel_location.id;


--
-- TOC entry 246 (class 1259 OID 16764)
-- Name: hotel_meal_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_meal_types (
    id integer NOT NULL,
    hotel_id integer,
    type_name character varying NOT NULL,
    price numeric,
    description text[]
);


ALTER TABLE public.hotel_meal_types OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16679)
-- Name: hotel_pools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_pools (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_pools OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16678)
-- Name: hotel_pools_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_pools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_pools_id_seq OWNER TO postgres;

--
-- TOC entry 5263 (class 0 OID 0)
-- Dependencies: 235
-- Name: hotel_pools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_pools_id_seq OWNED BY public.hotel_pools.id;


--
-- TOC entry 244 (class 1259 OID 16750)
-- Name: hotel_restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_restaurants (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_restaurants OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16749)
-- Name: hotel_restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_restaurants_id_seq OWNER TO postgres;

--
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 243
-- Name: hotel_restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_restaurants_id_seq OWNED BY public.hotel_restaurants.id;


--
-- TOC entry 254 (class 1259 OID 17047)
-- Name: hotel_room_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_room_types (
    id integer NOT NULL,
    hotel_id integer,
    name character varying NOT NULL,
    capacity integer NOT NULL,
    price numeric NOT NULL,
    photo_url text NOT NULL,
    amenities text[]
);


ALTER TABLE public.hotel_room_types OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 17046)
-- Name: hotel_room_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_room_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_room_types_id_seq OWNER TO postgres;

--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 253
-- Name: hotel_room_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_room_types_id_seq OWNED BY public.hotel_room_types.id;


--
-- TOC entry 264 (class 1259 OID 17118)
-- Name: hotel_surroundings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_surroundings (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_surroundings OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 17117)
-- Name: hotel_serroundings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_serroundings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_serroundings_id_seq OWNER TO postgres;

--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 263
-- Name: hotel_serroundings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_serroundings_id_seq OWNED BY public.hotel_surroundings.id;


--
-- TOC entry 240 (class 1259 OID 16707)
-- Name: hotel_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_services (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_services OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16706)
-- Name: hotel_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_services_id_seq OWNER TO postgres;

--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 239
-- Name: hotel_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_services_id_seq OWNED BY public.hotel_services.id;


--
-- TOC entry 238 (class 1259 OID 16693)
-- Name: hotel_spas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_spas (
    id integer NOT NULL,
    hotel_id integer,
    description text[]
);


ALTER TABLE public.hotel_spas OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16692)
-- Name: hotel_spas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_spas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_spas_id_seq OWNER TO postgres;

--
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 237
-- Name: hotel_spas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_spas_id_seq OWNED BY public.hotel_spas.id;


--
-- TOC entry 218 (class 1259 OID 16413)
-- Name: hotels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotels (
    id integer NOT NULL,
    name character varying NOT NULL,
    country character varying NOT NULL,
    star_rating smallint,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    hotel_photos text,
    is_hot_deal boolean DEFAULT false,
    tour_start_date timestamp without time zone,
    tour_end_date timestamp without time zone,
    tour_price numeric,
    average_rating numeric,
    review_count integer DEFAULT 0,
    included_meal_types text,
    season character varying,
    total_orders integer DEFAULT 0,
    city character varying(255),
    amenity text[],
    CONSTRAINT hotels_star_rating_check CHECK (((star_rating >= 1) AND (star_rating <= 5)))
);


ALTER TABLE public.hotels OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16412)
-- Name: hotels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotels_id_seq OWNER TO postgres;

--
-- TOC entry 5269 (class 0 OID 0)
-- Dependencies: 217
-- Name: hotels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotels_id_seq OWNED BY public.hotels.id;


--
-- TOC entry 245 (class 1259 OID 16763)
-- Name: meal_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meal_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meal_types_id_seq OWNER TO postgres;

--
-- TOC entry 5270 (class 0 OID 0)
-- Dependencies: 245
-- Name: meal_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meal_types_id_seq OWNED BY public.hotel_meal_types.id;


--
-- TOC entry 252 (class 1259 OID 16957)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    token character varying(255) NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    revoked boolean DEFAULT false
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16956)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 251
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 222 (class 1259 OID 16447)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    hotel_id integer,
    user_id integer,
    rating smallint,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    food_rating numeric,
    room_rating numeric,
    staff_rating numeric,
    price_rating numeric,
    beach_rating numeric,
    animation_rating numeric,
    CONSTRAINT reviews_animation_rating_check CHECK (((animation_rating >= (0)::numeric) AND (animation_rating <= (10)::numeric))),
    CONSTRAINT reviews_beach_rating_check CHECK (((beach_rating >= (0)::numeric) AND (beach_rating <= (10)::numeric))),
    CONSTRAINT reviews_food_rating_check CHECK (((food_rating >= (0)::numeric) AND (food_rating <= (10)::numeric))),
    CONSTRAINT reviews_price_rating_check CHECK (((price_rating >= (0)::numeric) AND (price_rating <= (10)::numeric))),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 10))),
    CONSTRAINT reviews_room_rating_check CHECK (((room_rating >= (0)::numeric) AND (room_rating <= (10)::numeric))),
    CONSTRAINT reviews_staff_rating_check CHECK (((staff_rating >= (0)::numeric) AND (staff_rating <= (10)::numeric)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16446)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 221
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 220 (class 1259 OID 16426)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying DEFAULT 'user'::character varying,
    avatar_url text,
    email_verified boolean DEFAULT false,
    email_verification_token character varying(255),
    deleted_at timestamp without time zone,
    is_active boolean DEFAULT true,
    is_subscribed boolean DEFAULT true,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying, 'manager'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16425)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4866 (class 2604 OID 16481)
-- Name: average_ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.average_ratings ALTER COLUMN id SET DEFAULT nextval('public.average_ratings_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 17135)
-- Name: booking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking ALTER COLUMN id SET DEFAULT nextval('public.booking_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 17168)
-- Name: booking_children id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_children ALTER COLUMN id SET DEFAULT nextval('public.booking_children_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 17234)
-- Name: booking_contract id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_contract ALTER COLUMN id SET DEFAULT nextval('public.booking_contract_id_seq'::regclass);


--
-- TOC entry 4904 (class 2604 OID 33967)
-- Name: booking_flight id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_flight ALTER COLUMN id SET DEFAULT nextval('public.booking_flight_id_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 17198)
-- Name: booking_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services ALTER COLUMN id SET DEFAULT nextval('public.booking_services_id_seq'::regclass);


--
-- TOC entry 4900 (class 2604 OID 17213)
-- Name: booking_tourists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_tourists ALTER COLUMN id SET DEFAULT nextval('public.booking_tourists_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 25767)
-- Name: company_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_reviews ALTER COLUMN id SET DEFAULT nextval('public.company_reviews_id_seq'::regclass);


--
-- TOC entry 4879 (class 2604 OID 16797)
-- Name: contact_forms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_forms ALTER COLUMN id SET DEFAULT nextval('public.contact_forms_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 16807)
-- Name: email_subscribers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_subscribers ALTER COLUMN id SET DEFAULT nextval('public.email_subscribers_id_seq'::regclass);


--
-- TOC entry 4872 (class 2604 OID 16668)
-- Name: hotel_activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_activities ALTER COLUMN id SET DEFAULT nextval('public.hotel_activities_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 17079)
-- Name: hotel_airport_distance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_airport_distance ALTER COLUMN id SET DEFAULT nextval('public.hotel_airport_distance_id_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 17065)
-- Name: hotel_amenities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_amenities ALTER COLUMN id SET DEFAULT nextval('public.hotel_amenities_id_seq'::regclass);


--
-- TOC entry 4870 (class 2604 OID 16640)
-- Name: hotel_beach id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_beach ALTER COLUMN id SET DEFAULT nextval('public.beach_features_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 17093)
-- Name: hotel_communication id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_communication ALTER COLUMN id SET DEFAULT nextval('public.hotel_communication_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 16724)
-- Name: hotel_contacts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_contacts ALTER COLUMN id SET DEFAULT nextval('public.hotel_contacts_id_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 16496)
-- Name: hotel_gallery id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_gallery ALTER COLUMN id SET DEFAULT nextval('public.hotel_gallery_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 16654)
-- Name: hotel_general id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_general ALTER COLUMN id SET DEFAULT nextval('public.hotel_general_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 17107)
-- Name: hotel_kids id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_kids ALTER COLUMN id SET DEFAULT nextval('public.hotel_kids_id_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 16586)
-- Name: hotel_location id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_location ALTER COLUMN id SET DEFAULT nextval('public.hotel_location_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 16767)
-- Name: hotel_meal_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_meal_types ALTER COLUMN id SET DEFAULT nextval('public.meal_types_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 16682)
-- Name: hotel_pools id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_pools ALTER COLUMN id SET DEFAULT nextval('public.hotel_pools_id_seq'::regclass);


--
-- TOC entry 4877 (class 2604 OID 16753)
-- Name: hotel_restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_restaurants ALTER COLUMN id SET DEFAULT nextval('public.hotel_restaurants_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 17050)
-- Name: hotel_room_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_room_types ALTER COLUMN id SET DEFAULT nextval('public.hotel_room_types_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 16710)
-- Name: hotel_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_services ALTER COLUMN id SET DEFAULT nextval('public.hotel_services_id_seq'::regclass);


--
-- TOC entry 4874 (class 2604 OID 16696)
-- Name: hotel_spas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_spas ALTER COLUMN id SET DEFAULT nextval('public.hotel_spas_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 17121)
-- Name: hotel_surroundings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_surroundings ALTER COLUMN id SET DEFAULT nextval('public.hotel_serroundings_id_seq'::regclass);


--
-- TOC entry 4852 (class 2604 OID 16416)
-- Name: hotels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotels ALTER COLUMN id SET DEFAULT nextval('public.hotels_id_seq'::regclass);


--
-- TOC entry 4884 (class 2604 OID 16960)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4864 (class 2604 OID 16450)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4857 (class 2604 OID 16429)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5183 (class 0 OID 16478)
-- Dependencies: 224
-- Data for Name: average_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5225 (class 0 OID 17132)
-- Dependencies: 266
-- Data for Name: booking; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5227 (class 0 OID 17165)
-- Dependencies: 268
-- Data for Name: booking_children; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5233 (class 0 OID 17231)
-- Dependencies: 274
-- Data for Name: booking_contract; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5237 (class 0 OID 33964)
-- Dependencies: 278
-- Data for Name: booking_flight; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5229 (class 0 OID 17195)
-- Dependencies: 270
-- Data for Name: booking_services; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5231 (class 0 OID 17210)
-- Dependencies: 272
-- Data for Name: booking_tourists; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5235 (class 0 OID 25764)
-- Dependencies: 276
-- Data for Name: company_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5207 (class 0 OID 16794)
-- Dependencies: 248
-- Data for Name: contact_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5209 (class 0 OID 16804)
-- Dependencies: 250
-- Data for Name: email_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5193 (class 0 OID 16665)
-- Dependencies: 234
-- Data for Name: hotel_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5217 (class 0 OID 17076)
-- Dependencies: 258
-- Data for Name: hotel_airport_distance; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5215 (class 0 OID 17062)
-- Dependencies: 256
-- Data for Name: hotel_amenities; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5189 (class 0 OID 16637)
-- Dependencies: 230
-- Data for Name: hotel_beach; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5219 (class 0 OID 17090)
-- Dependencies: 260
-- Data for Name: hotel_communication; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5201 (class 0 OID 16721)
-- Dependencies: 242
-- Data for Name: hotel_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5185 (class 0 OID 16493)
-- Dependencies: 226
-- Data for Name: hotel_gallery; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5191 (class 0 OID 16651)
-- Dependencies: 232
-- Data for Name: hotel_general; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5221 (class 0 OID 17104)
-- Dependencies: 262
-- Data for Name: hotel_kids; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5187 (class 0 OID 16583)
-- Dependencies: 228
-- Data for Name: hotel_location; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5205 (class 0 OID 16764)
-- Dependencies: 246
-- Data for Name: hotel_meal_types; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5195 (class 0 OID 16679)
-- Dependencies: 236
-- Data for Name: hotel_pools; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5203 (class 0 OID 16750)
-- Dependencies: 244
-- Data for Name: hotel_restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5213 (class 0 OID 17047)
-- Dependencies: 254
-- Data for Name: hotel_room_types; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5199 (class 0 OID 16707)
-- Dependencies: 240
-- Data for Name: hotel_services; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5197 (class 0 OID 16693)
-- Dependencies: 238
-- Data for Name: hotel_spas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5223 (class 0 OID 17118)
-- Dependencies: 264
-- Data for Name: hotel_surroundings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5177 (class 0 OID 16413)
-- Dependencies: 218
-- Data for Name: hotels; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5211 (class 0 OID 16957)
-- Dependencies: 252
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5181 (class 0 OID 16447)
-- Dependencies: 222
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5179 (class 0 OID 16426)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 223
-- Name: average_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.average_ratings_id_seq', 1, false);


--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 229
-- Name: beach_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.beach_features_id_seq', 1, false);


--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 267
-- Name: booking_children_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_children_id_seq', 1, false);


--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 273
-- Name: booking_contract_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_contract_id_seq', 1, false);


--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 277
-- Name: booking_flight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_flight_id_seq', 1, false);


--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 265
-- Name: booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_id_seq', 1, false);


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 269
-- Name: booking_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_services_id_seq', 1, false);


--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 271
-- Name: booking_tourists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_tourists_id_seq', 1, false);


--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 275
-- Name: company_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_reviews_id_seq', 1, false);


--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 247
-- Name: contact_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_forms_id_seq', 1, false);


--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 249
-- Name: email_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_subscribers_id_seq', 1, false);


--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 233
-- Name: hotel_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_activities_id_seq', 1, false);


--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 257
-- Name: hotel_airport_distance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_airport_distance_id_seq', 1, false);


--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 255
-- Name: hotel_amenities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_amenities_id_seq', 1, false);


--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 259
-- Name: hotel_communication_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_communication_id_seq', 1, false);


--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 241
-- Name: hotel_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_contacts_id_seq', 1, false);


--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 225
-- Name: hotel_gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_gallery_id_seq', 1, false);


--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 231
-- Name: hotel_general_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_general_id_seq', 1, false);


--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 261
-- Name: hotel_kids_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_kids_id_seq', 1, false);


--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 227
-- Name: hotel_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_location_id_seq', 1, false);


--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 235
-- Name: hotel_pools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_pools_id_seq', 1, false);


--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 243
-- Name: hotel_restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_restaurants_id_seq', 1, false);


--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 253
-- Name: hotel_room_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_room_types_id_seq', 1, false);


--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 263
-- Name: hotel_serroundings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_serroundings_id_seq', 1, false);


--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 239
-- Name: hotel_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_services_id_seq', 1, false);


--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 237
-- Name: hotel_spas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_spas_id_seq', 1, false);


--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 217
-- Name: hotels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotels_id_seq', 1, false);


--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 245
-- Name: meal_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meal_types_id_seq', 1, false);


--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 251
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 1, false);


--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 221
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 4932 (class 2606 OID 16485)
-- Name: average_ratings average_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.average_ratings
    ADD CONSTRAINT average_ratings_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 16644)
-- Name: hotel_beach beach_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_beach
    ADD CONSTRAINT beach_features_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 17170)
-- Name: booking_children booking_children_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_children
    ADD CONSTRAINT booking_children_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 2606 OID 17238)
-- Name: booking_contract booking_contract_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_contract
    ADD CONSTRAINT booking_contract_pkey PRIMARY KEY (id);


--
-- TOC entry 4990 (class 2606 OID 33973)
-- Name: booking_flight booking_flight_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_flight
    ADD CONSTRAINT booking_flight_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 17141)
-- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 2606 OID 17203)
-- Name: booking_services booking_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 17215)
-- Name: booking_tourists booking_tourists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_tourists
    ADD CONSTRAINT booking_tourists_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 25773)
-- Name: company_reviews company_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_reviews
    ADD CONSTRAINT company_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 16802)
-- Name: contact_forms contact_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_forms
    ADD CONSTRAINT contact_forms_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 16814)
-- Name: email_subscribers email_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_subscribers
    ADD CONSTRAINT email_subscribers_email_key UNIQUE (email);


--
-- TOC entry 4960 (class 2606 OID 16812)
-- Name: email_subscribers email_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_subscribers
    ADD CONSTRAINT email_subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 16672)
-- Name: hotel_activities hotel_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_activities
    ADD CONSTRAINT hotel_activities_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 17083)
-- Name: hotel_airport_distance hotel_airport_distance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_airport_distance
    ADD CONSTRAINT hotel_airport_distance_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 17069)
-- Name: hotel_amenities hotel_amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_amenities
    ADD CONSTRAINT hotel_amenities_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 2606 OID 17097)
-- Name: hotel_communication hotel_communication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_communication
    ADD CONSTRAINT hotel_communication_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 16728)
-- Name: hotel_contacts hotel_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_contacts
    ADD CONSTRAINT hotel_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 16501)
-- Name: hotel_gallery hotel_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_gallery
    ADD CONSTRAINT hotel_gallery_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 16658)
-- Name: hotel_general hotel_general_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_general
    ADD CONSTRAINT hotel_general_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 17111)
-- Name: hotel_kids hotel_kids_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_kids
    ADD CONSTRAINT hotel_kids_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 16588)
-- Name: hotel_location hotel_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_location
    ADD CONSTRAINT hotel_location_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 16686)
-- Name: hotel_pools hotel_pools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_pools
    ADD CONSTRAINT hotel_pools_pkey PRIMARY KEY (id);


--
-- TOC entry 4952 (class 2606 OID 16757)
-- Name: hotel_restaurants hotel_restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_restaurants
    ADD CONSTRAINT hotel_restaurants_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 17054)
-- Name: hotel_room_types hotel_room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_room_types
    ADD CONSTRAINT hotel_room_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 17125)
-- Name: hotel_surroundings hotel_serroundings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_surroundings
    ADD CONSTRAINT hotel_serroundings_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 16714)
-- Name: hotel_services hotel_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_services
    ADD CONSTRAINT hotel_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 16700)
-- Name: hotel_spas hotel_spas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_spas
    ADD CONSTRAINT hotel_spas_pkey PRIMARY KEY (id);


--
-- TOC entry 4922 (class 2606 OID 16424)
-- Name: hotels hotels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotels
    ADD CONSTRAINT hotels_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 16771)
-- Name: hotel_meal_types meal_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_meal_types
    ADD CONSTRAINT meal_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 16965)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4964 (class 2606 OID 16967)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 4930 (class 2606 OID 16463)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4924 (class 2606 OID 16442)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4926 (class 2606 OID 16438)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4928 (class 2606 OID 16440)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5028 (class 2620 OID 33956)
-- Name: hotel_amenities after_hotel_amenities_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_hotel_amenities_insert AFTER INSERT ON public.hotel_amenities FOR EACH ROW EXECUTE FUNCTION public.update_hotel_amenities();


--
-- TOC entry 5027 (class 2620 OID 25756)
-- Name: hotel_gallery after_photo_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_photo_insert AFTER INSERT ON public.hotel_gallery FOR EACH ROW EXECUTE FUNCTION public.update_hotel_photos();


--
-- TOC entry 5024 (class 2620 OID 16476)
-- Name: reviews after_review_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_review_delete AFTER DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_average_rating();


--
-- TOC entry 5025 (class 2620 OID 16475)
-- Name: reviews after_review_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_review_insert AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_average_rating();


--
-- TOC entry 5029 (class 2620 OID 17163)
-- Name: booking set_last_modified; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_last_modified BEFORE UPDATE ON public.booking FOR EACH ROW EXECUTE FUNCTION public.update_last_modified();


--
-- TOC entry 5030 (class 2620 OID 25761)
-- Name: booking trigger_update_total_orders; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_total_orders AFTER UPDATE ON public.booking FOR EACH ROW EXECUTE FUNCTION public.update_total_orders();


--
-- TOC entry 5026 (class 2620 OID 25757)
-- Name: reviews update_average_ratings_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_average_ratings_trigger AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_average_ratings();


--
-- TOC entry 5023 (class 2620 OID 16444)
-- Name: users update_user_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4993 (class 2606 OID 16486)
-- Name: average_ratings average_ratings_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.average_ratings
    ADD CONSTRAINT average_ratings_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 4996 (class 2606 OID 16645)
-- Name: hotel_beach beach_features_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_beach
    ADD CONSTRAINT beach_features_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 5016 (class 2606 OID 17171)
-- Name: booking_children booking_children_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_children
    ADD CONSTRAINT booking_children_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(id) ON DELETE CASCADE;


--
-- TOC entry 5019 (class 2606 OID 17239)
-- Name: booking_contract booking_contract_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_contract
    ADD CONSTRAINT booking_contract_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(id) ON DELETE CASCADE;


--
-- TOC entry 5022 (class 2606 OID 33974)
-- Name: booking_flight booking_flight_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_flight
    ADD CONSTRAINT booking_flight_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(id) ON DELETE CASCADE;


--
-- TOC entry 5012 (class 2606 OID 17147)
-- Name: booking booking_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE SET NULL;


--
-- TOC entry 5013 (class 2606 OID 17157)
-- Name: booking booking_meal_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_meal_plan_id_fkey FOREIGN KEY (meal_plan_id) REFERENCES public.hotel_meal_types(id) ON DELETE SET NULL;


--
-- TOC entry 5014 (class 2606 OID 17152)
-- Name: booking booking_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.hotel_room_types(id) ON DELETE SET NULL;


--
-- TOC entry 5017 (class 2606 OID 17204)
-- Name: booking_services booking_services_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(id) ON DELETE CASCADE;


--
-- TOC entry 5018 (class 2606 OID 17216)
-- Name: booking_tourists booking_tourists_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_tourists
    ADD CONSTRAINT booking_tourists_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(id) ON DELETE CASCADE;


--
-- TOC entry 5015 (class 2606 OID 17142)
-- Name: booking booking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5020 (class 2606 OID 25779)
-- Name: company_reviews company_reviews_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_reviews
    ADD CONSTRAINT company_reviews_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- TOC entry 5021 (class 2606 OID 25774)
-- Name: company_reviews company_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_reviews
    ADD CONSTRAINT company_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5005 (class 2606 OID 16968)
-- Name: refresh_tokens fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4998 (class 2606 OID 16673)
-- Name: hotel_activities hotel_activities_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_activities
    ADD CONSTRAINT hotel_activities_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 17084)
-- Name: hotel_airport_distance hotel_airport_distance_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_airport_distance
    ADD CONSTRAINT hotel_airport_distance_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- TOC entry 5007 (class 2606 OID 17070)
-- Name: hotel_amenities hotel_amenities_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_amenities
    ADD CONSTRAINT hotel_amenities_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- TOC entry 5009 (class 2606 OID 17098)
-- Name: hotel_communication hotel_communication_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_communication
    ADD CONSTRAINT hotel_communication_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- TOC entry 5002 (class 2606 OID 16729)
-- Name: hotel_contacts hotel_contacts_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_contacts
    ADD CONSTRAINT hotel_contacts_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 16502)
-- Name: hotel_gallery hotel_gallery_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_gallery
    ADD CONSTRAINT hotel_gallery_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 16659)
-- Name: hotel_general hotel_general_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_general
    ADD CONSTRAINT hotel_general_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 17112)
-- Name: hotel_kids hotel_kids_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_kids
    ADD CONSTRAINT hotel_kids_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- TOC entry 4995 (class 2606 OID 16589)
-- Name: hotel_location hotel_location_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_location
    ADD CONSTRAINT hotel_location_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 4999 (class 2606 OID 16687)
-- Name: hotel_pools hotel_pools_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_pools
    ADD CONSTRAINT hotel_pools_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 5003 (class 2606 OID 16758)
-- Name: hotel_restaurants hotel_restaurants_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_restaurants
    ADD CONSTRAINT hotel_restaurants_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 5006 (class 2606 OID 17055)
-- Name: hotel_room_types hotel_room_types_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_room_types
    ADD CONSTRAINT hotel_room_types_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- TOC entry 5011 (class 2606 OID 17126)
-- Name: hotel_surroundings hotel_serroundings_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_surroundings
    ADD CONSTRAINT hotel_serroundings_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id);


--
-- TOC entry 5001 (class 2606 OID 16715)
-- Name: hotel_services hotel_services_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_services
    ADD CONSTRAINT hotel_services_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 5000 (class 2606 OID 16701)
-- Name: hotel_spas hotel_spas_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_spas
    ADD CONSTRAINT hotel_spas_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 5004 (class 2606 OID 16772)
-- Name: hotel_meal_types meal_types_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_meal_types
    ADD CONSTRAINT meal_types_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 4991 (class 2606 OID 16464)
-- Name: reviews reviews_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 16469)
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2025-05-12 21:28:17

--
-- PostgreSQL database dump complete
--

