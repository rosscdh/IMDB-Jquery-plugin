'use strict';
/*
Copyright (c) 2013 Ross Crawford-d'Heureuse.

2013. Updated by Ross Crawford-d'Heureuse <sendrossemail+imdb@gmail.com> to be a jquery.plugin
*/
$(function() {
    // the widget definition, where "custom" is the namespace,
    // "colorize" the widget name
    $.widget( "rcdh.imdb", {
        // default options
        key: undefined,
        search_by: undefined,
        search_param: undefined,

        display_template: function () {
            return ' \
            <div style="background:#FFFFFF;font-family:Arial,Verdana,Tahoma,sans-serif;font-size:13px;overflow:hidden;" class="imdb_widget rcdh_imdb"> \
              <a href="http://www.imdb.com/title/{{ imdbID }}/" target="_blank"><img alt="{{ Title }}" src="{{ Poster }}" class="imdb_image"></a> \
              <h3 class="titlero"><a href="http://www.imdb.com/title/{{ imdbID }}/" target="_blank">{{ Title }}</a></h3> \
              <p class="cast">Cast: {{ Actors }}</p> \
              <p class="directors">Director: {{ Director }} </p> \
              <p class="writers">Writer: {{ Writer }} </p> \
              <p class="runtime">Runtime: {{ Runtime }}</p> \
              <p class="genres">Genre: {{ Genre }}</p> \
              <p class="genres">Rating: {{ imdbRating }}</p> \
              <p class="genres">Votes: {{ imdbVotes }}</p> \
              <p class="plot"> \
              {{ Plot }} \
              </p> \
            </div>';
        },

        options: {
            'imdb_uri': 'http://www.imdbapi.com/?{search_param}={key}',
            'movie_title': undefined,                                           // - the Title of the movie
            'imdb_key': undefined,                                              // - the IMDB key for the film
            'display_template': undefined,                                      // - Must be an HTML template (**supports handlebarsjs.com)
            'found_callback': undefined,                                        // - Callback that can be called when the item is found
            'complete_callback': undefined,                                     // - Callback that can be called when the render is complete
            'debug': true,
        },

        _log: function (msg) {
            var self = this;
            if (self.options.debug === true) {
                console.log(msg)
            }
        },
        // the constructor
        _create: function() {
            var self = this;
            self.key = (self.options.imdb_key) ? self.options.imdb_key : (self.options.movie_title) ? self.options.movie_title : undefined;
            self.search_by = (self.options.imdb_key) ? 'imdb_key' : (self.options.movie_title) ? 'movie_title' : undefined;
            self.search_param = (self.options.imdb_key) ? 'i' : (self.options.movie_title) ? 't' : undefined;

            self.options.found_callback = (self.options.found_callback) ? self.options.found_callback : self.show ;

            self.display_template = (self.options.display_template) ? self.options.display_template : self.display_template;

            if ( ! self.key || ! self.search_by || ! self.search_param ) {
                $.error('You must provide a movie_title OR a imdb_key value');

            } else {

                if ( typeof self.key == 'string' ) {
                    // turn it into an array
                    self.key = [self.key];
                }

                this._listen();

            }
        },
        _listen: function () {
            var self = this;
            self.query_imdb();
        },
        render_template: function () {
            var self = this;
            if ( typeof self.display_template == 'function' ) {
                return Handlebars.compile(self.display_template());
            } else {
                // is a string
                return Handlebars.compile(self.display_template);
            }
        },
        show: function (jsonData, html, self) {
            self.element.append(html);
            if ( self.options.complete_callback ) {
                self.options.complete_callback(html, self);
            }
        },
        query_imdb: function () {
            var self = this;
            var template = self.render_template();

            $.each( self.key, function (i, movie_key) {
                var url = self.options.imdb_uri.assign({'search_param': self.search_param, 'key': movie_key})
                self._log('Calling URI: {uri}'.assign({'uri': url}));

                $.ajax({
                    type: 'GET',
                    url: url,
                    datatype: "jsonp",
                    success: function(data, textStatus, jqXHR){
                        self._log('Success got a response: {data}'.assign({'data': data}))
                        var jsonData = $.parseJSON(data);

                        var html = template(jsonData);

                        if ( self.options.found_callback ) {
                            self.options.found_callback(jsonData, html, self);
                        }
                    },

                    error: function(data, textStatus, jqXHR){
                        self._log('There was an error')
                    },

                    complete: function() {
                        self._log('Completed Call')
                    }
                }); // end ajax
            }); // end each

        }
    });
});
